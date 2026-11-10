import { router } from "expo-router";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  onSnapshot,
  deleteDoc,
  updateDoc,
  runTransaction,
  deleteField,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getDeviceId, getLegacyDeviceId, getInstallTime, getDeviceName, MAX_DEVICES } from "@/lib/device";
import {
  loadEntitlement,
  saveEntitlement,
  clearEntitlement,
  getLastUid,
  CachedEntitlement,
} from "@/lib/entitlement";

interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  premiumUnlocked: boolean;
  vip: boolean;
}

export type DeviceStatus = "ok" | "limit" | null;
export type HandoffResult = "ok" | "limit" | "error";

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const serverSyncRef = useRef(0);
  const hydratedUidRef = useRef<string | null>(null);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDocUnsubRef = useRef<(() => void) | null>(null);
  // deviceStatus also lives in a ref: the Firestore listener is created once
  // (empty deps) and must persist the CURRENT status to the receipt, not the
  // status captured when the effect first ran.
  const deviceStatusRef = useRef<DeviceStatus>(null);

  const applyDeviceStatus = (status: DeviceStatus) => {
    deviceStatusRef.current = status;
    setDeviceStatus(status);
  };

  // Force a server read of the user document and write the receipt to disk
  // BEFORE the caller reports success. This is the guarantee that makes the
  // offline launch work: by the time sign-in finishes, the entitlement is
  // already in AsyncStorage, so pulling the network immediately afterwards
  // cannot lose it.
  //
  // Returns the receipt on success, or null when the server could not be
  // reached after retries (the caller must then surface a blocking error).
  const syncEntitlementNow = async (
    userId: string,
    status: DeviceStatus,
    fallback?: { email?: string | null; displayName?: string | null }
  ): Promise<CachedEntitlement | null> => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const snap = await getDocFromServer(doc(db, "users", userId));
        const data = snap.data();
        const receipt: CachedEntitlement = {
          uid: userId,
          email: data?.email || fallback?.email || "",
          displayName: data?.displayName || fallback?.displayName || "",
          premiumUnlocked: data?.premiumUnlocked === true,
          vip: data?.vip === true,
          deviceStatus: status,
          verifiedAt: Date.now(),
        };
        await saveEntitlement(receipt);
        serverSyncRef.current = receipt.verifiedAt;
        setLastSyncedAt(receipt.verifiedAt);
        setIsOffline(false);
        return receipt;
      } catch (error) {
        console.error(`[Auth] Entitlement sync attempt ${attempt} failed:`, error);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 800));
        }
      }
    }
    return null;
  };

  // Register (or touch) this phone on the user's account.
  // Returns "ok" when this phone is one of the allowed devices,
  // "limit" when both device slots are taken by other phones.
  const registerCurrentDevice = async (userId: string): Promise<"ok" | "limit"> => {
    const deviceId = await getDeviceId();
    const legacyId = await getLegacyDeviceId();
    const installTime = await getInstallTime();
    const deviceName = getDeviceName();
    const now = Date.now();
    const staleMs = 30 * 24 * 60 * 60 * 1000;
    const userRef = doc(db, "users", userId);

    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef);
      const devices: Record<string, any> = { ...(snap.data()?.devices ?? {}) };

      // Adopt the previous installation-scoped id so updating from an older
      // build reuses this phone's existing slot instead of adding a new one.
      if (legacyId && legacyId !== deviceId && devices[legacyId]) {
        if (!devices[deviceId]) {
          devices[deviceId] = { ...devices[legacyId] };
        }
        delete devices[legacyId];
      }

      // Fresh install (no local legacy id) with every slot taken: adopt the
      // most recently used entry with this phone's name instead of blocking
      // the owner on the device-limit screen.
      if (!devices[deviceId] && installTime && Object.keys(devices).length >= MAX_DEVICES) {
        const candidates = Object.entries(devices)
          .filter(
            ([, d]) =>
              d?.name === deviceName &&
              (d?.lastSeen ?? d?.registeredAt ?? 0) < installTime
          )
          .sort((a, b) => (b[1]?.lastSeen ?? 0) - (a[1]?.lastSeen ?? 0));
        if (candidates.length > 0) {
          const [oldId, oldData] = candidates[0];
          devices[deviceId] = { ...oldData, name: deviceName, lastSeen: now };
          delete devices[oldId];
        }
      }

      let current = devices[deviceId];

      if (current) {
        current = { ...current, name: deviceName, lastSeen: now };
        devices[deviceId] = current;
      } else {
        // Free up slots held by phones unused for 30+ days (3A).
        for (const [id, d] of Object.entries(devices)) {
          const lastSeen = d?.lastSeen ?? d?.registeredAt ?? 0;
          if (now - lastSeen > staleMs) {
            delete devices[id];
          }
        }

        if (Object.keys(devices).length >= MAX_DEVICES) {
          return "limit" as const;
        }

        current = { name: deviceName, registeredAt: now, lastSeen: now };
        devices[deviceId] = current;
      }

        // Clean up entries created by the old concurrent-registration race:
        // same device name, registered within seconds of this one.
        const registeredAt = typeof current?.registeredAt === "number" ? current.registeredAt : null;
        if (registeredAt !== null) {
          for (const [id, d] of Object.entries(devices)) {
            if (id === deviceId) continue;
            const otherRegisteredAt = typeof d?.registeredAt === "number" ? d.registeredAt : 0;
            if (d?.name === deviceName && Math.abs(otherRegisteredAt - registeredAt) <= 10_000) {
              delete devices[id];
            }
          }
        }


      // Replace the whole `devices` map so deleted keys are actually removed.
      if (snap.exists()) {
        tx.update(userRef, { devices });
      } else {
        tx.set(userRef, { devices });
      }
      return "ok" as const;
    });

    applyDeviceStatus(result);
    return result;
  };

  // Registration can hit transient network/permission blips right after a
  // deep-link handoff. Retry a few times so deviceStatus reliably settles
  // to "ok" or "limit" instead of being stuck null. On total failure we
  // return "error" — NEVER "limit": a dead network is not a device limit.
  // Concurrent callers (the auth listener and the website handoff) share one
  // in-flight registration so a fresh install cannot register twice.
  const registrationRef = useRef<{ userId: string; promise: Promise<HandoffResult> } | null>(null);

  const registerWithRetry = async (userId: string): Promise<HandoffResult> => {
    const existing = registrationRef.current;
    if (existing && existing.userId === userId) {
      return existing.promise;
    }

    const promise = (async (): Promise<HandoffResult> => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          return await registerCurrentDevice(userId);
        } catch (error) {
          console.error(`[Auth] Device registration attempt ${attempt} failed:`, error);
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
          }
        }
      }
      // All attempts threw: network/permission problem, not a device limit.
      return "error" as const;
    })();

    registrationRef.current = { userId, promise };
    try {
      return await promise;
    } finally {
      if (registrationRef.current?.promise === promise) {
        registrationRef.current = null;
      }
    }
  };

  // Mirror of the current user document. Its unsubscribe is held in a ref so
  // it is always torn down on sign-out / unmount: returning it from inside the
  // async auth callback would be ignored by Firebase and leak the listener
  // (letting a signed-out account's data leak back into the app).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        if (restoreTimerRef.current) {
          clearTimeout(restoreTimerRef.current);
          restoreTimerRef.current = null;
        }
        // Unblock the UI immediately. Gating the whole app on the Firestore
        // read meant an offline launch could strand the user on the splash
        // forever — KISS: show the app, let premium fill in when it arrives.
        setIsLoading(false);

        if (hydratedUidRef.current !== firebaseUser.uid) {
          // New account (or first restore): start its sync window clean so the
          // cached receipt can hydrate before the network answers.
          hydratedUidRef.current = firebaseUser.uid;
          serverSyncRef.current = 0;
          setLastSyncedAt(null);
          setIsOffline(false);
          setUser(null);
          loadEntitlement(firebaseUser.uid)
            .then((cached) => {
              if (!cached) {
                // Signed in but nothing cached (fresh install): show the
                // identity as free rather than looking signed out offline.
                if (serverSyncRef.current === 0) {
                  setUser({
                    userId: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    displayName: firebaseUser.displayName || "",
                    premiumUnlocked: false,
                    vip: false,
                  });
                }
                return;
              }
              // Never overwrite a snapshot that already succeeded for this user.
              if (serverSyncRef.current > 0 && serverSyncRef.current >= cached.verifiedAt) return;
              setUser({
                userId: firebaseUser.uid,
                email: cached.email || firebaseUser.email || "",
                displayName: cached.displayName || firebaseUser.displayName || "",
                premiumUnlocked: cached.premiumUnlocked,
                vip: cached.vip,
              });
              applyDeviceStatus(cached.deviceStatus ?? null);
              setLastSyncedAt(cached.verifiedAt);
              setIsLoading(false);
            })
            .catch((error) => console.warn("[Auth] entitlement cache read failed:", error));

          // Firestore's listener stays silent while offline (it retries instead
          // of erroring), so surface "offline" after a short window. The cached
          // receipt keeps the app unlocked either way.
          if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
          offlineTimerRef.current = setTimeout(() => {
            if (serverSyncRef.current === 0) setIsOffline(true);
          }, 6000);
        }

        // Keep this phone's registration/lastSeen fresh on every launch.
        registerWithRetry(firebaseUser.uid).catch((error) => {
          console.error("[Auth] Device registration failed:", error);
        });

        userDocUnsubRef.current?.();
        userDocUnsubRef.current = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (snap) => {
            const data = snap.data();
            // `fromCache` means Firestore answered from a local buffer, not the
            // server. Never let that downgrade a confirmed entitlement.
            const fromCache = snap.metadata?.fromCache === true;
            if (offlineTimerRef.current) {
              clearTimeout(offlineTimerRef.current);
              offlineTimerRef.current = null;
            }
            setUser((prev) => {
              const premiumUnlocked = fromCache
                ? prev?.premiumUnlocked === true || data?.premiumUnlocked === true
                : data?.premiumUnlocked === true;
              return {
                userId: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "",
                premiumUnlocked,
                vip: data?.vip === true,
              };
            });
            if (!fromCache) {
              serverSyncRef.current = Date.now();
              setLastSyncedAt(serverSyncRef.current);
              setIsOffline(false);
              // Persist immediately (not via a React effect) so a quick
              // force-close right after a sync cannot lose the receipt.
              void saveEntitlement({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "",
                premiumUnlocked: data?.premiumUnlocked === true,
                vip: data?.vip === true,
                deviceStatus: deviceStatusRef.current,
                verifiedAt: serverSyncRef.current,
              });
            }
            setIsLoading(false);
          },
          (error) => {
            if (offlineTimerRef.current) {
              clearTimeout(offlineTimerRef.current);
              offlineTimerRef.current = null;
            }
            // Firestore reports a missing connection as "unavailable". Only
            // that (and timeouts) should surface as "offline"; a rules error
            // must not be disguised as a network problem.
            const code = (error as { code?: string })?.code;
            setIsOffline(code === "unavailable" || code === "deadline-exceeded");
            // A denied/offline read must not hide the user or hang the app.
            // Keep any known account (including cached premium); otherwise
            // fall back to identity only.
            console.error("[Auth] User snapshot failed:", error);
            setUser((prev) =>
              prev ?? {
                userId: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "",
                premiumUnlocked: false,
                vip: false,
              }
            );
            setIsLoading(false);
          }
        );
      } else {
        userDocUnsubRef.current?.();
        userDocUnsubRef.current = null;
        setUser(null);
        applyDeviceStatus(null);
        hydratedUidRef.current = null;
        serverSyncRef.current = 0;
        if (offlineTimerRef.current) {
          clearTimeout(offlineTimerRef.current);
          offlineTimerRef.current = null;
        }
        setLastSyncedAt(null);
        setIsOffline(false);
        setIsLoading(false);

        // Offline cold start: Firebase may fail to restore the persisted
        // session. If an entitlement receipt still exists, the account was
        // signed in the last time the app ran — hydrate it instead of showing
        // "not signed in". An explicit sign-out deletes the receipt first, so
        // a signed-out phone can never come back unlocked.
        if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = setTimeout(() => {
          restoreTimerRef.current = null;
          if (auth.currentUser) return; // a real session won the race
          void getLastUid()
            .then(async (lastUid) => {
              if (!lastUid || auth.currentUser) return;
              const cached = await loadEntitlement(lastUid);
              if (!cached || auth.currentUser) return;
              hydratedUidRef.current = lastUid;
              setUser({
                userId: cached.uid,
                email: cached.email,
                displayName: cached.displayName,
                premiumUnlocked: cached.premiumUnlocked,
                vip: cached.vip,
              });
              applyDeviceStatus(cached.deviceStatus ?? null);
              setLastSyncedAt(cached.verifiedAt);
              setIsOffline(true);
              setIsLoading(false);
            })
            .catch((error) => console.warn("[Auth] last-account restore failed:", error));
        }, 500);
      }
    });
    return () => {
      unsubscribe();
      userDocUnsubRef.current?.();
      userDocUnsubRef.current = null;
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
        offlineTimerRef.current = null;
      }
      if (restoreTimerRef.current) {
        clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!user || !lastSyncedAt) return;
    void saveEntitlement({
      uid: user.userId,
      email: user.email,
      displayName: user.displayName,
      premiumUnlocked: user.premiumUnlocked,
      vip: user.vip,
      deviceStatus,
      verifiedAt: lastSyncedAt,
    });
  }, [user, deviceStatus, lastSyncedAt]);

  // Check if a pending unlock exists for this email.
  // NOTE: pendingUnlocks docs are not readable by clients under the
  // secure rules — the server applies them in the createAppToken
  // callable. This stays as a best-effort fallback.
  const checkPendingUnlock = async (email: string, userId: string) => {
    try {
      const pendingRef = doc(db, "pendingUnlocks", email);
      const pendingDoc = await getDoc(pendingRef);

      if (pendingDoc.exists()) {
        // User paid before signing up — unlock them now
        await setDoc(doc(db, "users", userId), {
          premiumUnlocked: true,
          paymentDate: pendingDoc.data().unlockedAt,
          paymentRef: pendingDoc.data().transactionRef,
        }, { merge: true });

        // Remove pending unlock
        await deleteDoc(pendingRef);

        console.log("Pending unlock applied for:", email);
      }
    } catch (error) {
      console.error("Failed to check pending unlock:", error);
    }
  };

  // Website → app handoff: sign in with the one-time token minted by the
  // createAppToken Cloud Function, then register this phone.
  const completeWebHandoff = async (token: string): Promise<HandoffResult> => {
    console.log("[handoff] completeWebHandoff: signing in");
    console.log("[handoff] signing in…");
    try {
      const credential = await signInWithCustomToken(auth, token);
      console.log("[handoff] completeWebHandoff: signed in");
      if (credential.user.email) {
        await checkPendingUnlock(credential.user.email, credential.user.uid).catch(() => {});
      }
      const result = await registerWithRetry(credential.user.uid);
      const status: DeviceStatus =
        result === "limit" ? "limit" : result === "ok" ? "ok" : null;

      // The handoff is NOT finished until the receipt is on disk. The callback
      // screen stays on "Activating your hymns…" during this read+write, so a
      // user who turns data off right after signing in still gets premium.
      const receipt = await syncEntitlementNow(credential.user.uid, status, {
        email: credential.user.email,
        displayName: credential.user.displayName,
      });
      if (!receipt) {
        const failure = new Error("Couldn't confirm membership") as Error & { code: string };
        failure.code = "entitlement/sync-failed";
        throw failure;
      }

      if (result === "ok") {
        console.log("[handoff] result: ok");
        return "ok";
      }
      // VIP accounts are never blocked by device registration: the phone
      // registration still ran (it shows in the device list), but a limit
      // or a network failure must not lock the owner out of paid hymns.
      if (receipt.vip) {
        console.log("[handoff] result: ok (vip)");
        return "ok";
      }
      console.log("[handoff] result:", result);
      return result;
    } catch (error: any) {
      console.error("[handoff] sign in failed:", error.code);
      throw error;
    }
  };

  // Remove a registered phone from the account; if this phone was blocked
  // by the limit, retry registration right away (a slot just opened).
  const removeDevice = async (deviceId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.userId), {
      [`devices.${deviceId}`]: deleteField(),
    });
    if (deviceStatus !== "ok") {
      await registerCurrentDevice(user.userId).catch((error) => {
        console.error("[Auth] Re-registration after remove failed:", error);
      });
    }
  };

  const signIn = async (email: string, password: string): Promise<"ok" | "no-account" | "error"> => {
    setIsSigningIn(true);
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      // A pending-unlock lookup must never turn a successful login into a failure.
      await checkPendingUnlock(email, firebaseUser.uid).catch(() => {});
      const regStatus = await registerWithRetry(firebaseUser.uid).catch(
        (): HandoffResult => "error"
      );
      // Same guarantee as the website handoff: don't report success until the
      // receipt is written, otherwise an immediate disconnect loses premium.
      const receipt = await syncEntitlementNow(
        firebaseUser.uid,
        regStatus === "limit" ? "limit" : regStatus === "ok" ? "ok" : null,
        { email: firebaseUser.email, displayName: firebaseUser.displayName }
      );
      setIsSigningIn(false);
      return receipt ? "ok" : "error";
    } catch (error: any) {
      console.error("[Auth] Sign in failed:", error);
      setIsSigningIn(false);
      const code = error?.code;
      if (
        code === "auth/user-not-found" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials"
      ) {
        return "no-account";
      }
      return "error";
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsSigningUp(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUser, { displayName });

      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        displayName,
        premiumUnlocked: false,
        createdAt: new Date(),
      });

      // Check if they paid on website before signing up
      await checkPendingUnlock(email, firebaseUser.uid);
      const regStatus = await registerWithRetry(firebaseUser.uid).catch(
        (): HandoffResult => "error"
      );
      // New accounts are free, but the receipt still has to exist so the app
      // knows who is signed in when it opens without a connection.
      await syncEntitlementNow(
        firebaseUser.uid,
        regStatus === "limit" ? "limit" : regStatus === "ok" ? "ok" : null,
        { email, displayName }
      );

      router.replace("/");
    } catch (error: any) {
      console.error("[Auth] Sign up failed:", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          Alert.alert("Account Exists", "This email is already registered. Please sign in on our website instead.");
          break;
        case "auth/weak-password":
          Alert.alert("Weak Password", "Password must be at least 6 characters.");
          break;
        case "auth/invalid-email":
          Alert.alert("Invalid Email", "Please enter a valid email address.");
          break;
        default:
          Alert.alert("Error", "Failed to create account. Please try again.");
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const signOut = async () => {
    // Clear this account's cached receipt: signing out returns the phone to
    // free preview, exactly like the server-side entitlement.
    if (user?.userId) await clearEntitlement(user.userId);
    hydratedUidRef.current = null;
    serverSyncRef.current = 0;
    if (restoreTimerRef.current) {
      clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = null;
    }
    applyDeviceStatus(null);
    setLastSyncedAt(null);
    setIsOffline(false);
    await firebaseSignOut(auth);
    router.replace("/");
  };

  const signInWithGoogle = async () => {
    Alert.alert("Coming Soon", "Google sign-in will be available soon.");
  };

  return {
    user,
    isLoading,
    signIn,
    sendPasswordReset,
    signUp,
    signInWithGoogle,
    signOut,
    isSigningIn,
    isSigningUp,
    completeWebHandoff,
    registerCurrentDevice,
    removeDevice,
    deviceStatus,
    isOffline,
    lastSyncedAt,
  };
});

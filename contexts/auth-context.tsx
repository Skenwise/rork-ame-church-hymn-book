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
  onSnapshot,
  deleteDoc,
  updateDoc,
  runTransaction,
  deleteField,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getDeviceId, getLegacyDeviceId, getInstallTime, getDeviceName, MAX_DEVICES } from "@/lib/device";
import { loadEntitlement, saveEntitlement, clearEntitlement } from "@/lib/entitlement";

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
  const userDocUnsubRef = useRef<(() => void) | null>(null);

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

    setDeviceStatus(result);
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
      setDeviceStatus((prev) => prev ?? null);
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
              setDeviceStatus(cached.deviceStatus ?? null);
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
            serverSyncRef.current = Date.now();
            if (offlineTimerRef.current) {
              clearTimeout(offlineTimerRef.current);
              offlineTimerRef.current = null;
            }
            setLastSyncedAt(serverSyncRef.current);
            setIsOffline(false);
            setUser({
              userId: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              premiumUnlocked: data?.premiumUnlocked || false,
              vip: data?.vip === true,
            });
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
        setDeviceStatus(null);
        hydratedUidRef.current = null;
        serverSyncRef.current = 0;
        if (offlineTimerRef.current) {
          clearTimeout(offlineTimerRef.current);
          offlineTimerRef.current = null;
        }
        setLastSyncedAt(null);
        setIsOffline(false);
        setIsLoading(false);
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
      if (result === "ok") {
        console.log("[handoff] result: ok");
        return "ok";
      }
      // VIP accounts are never blocked by device registration: the phone
      // registration still ran (it shows in the device list), but a limit
      // or a network failure must not lock the owner out of paid hymns.
      try {
        const snap = await getDoc(doc(db, "users", credential.user.uid));
        if (snap.data()?.vip === true) {
          console.log("[handoff] result: ok (vip)");
          return "ok";
        }
      } catch (error) {
        console.error("[Auth] VIP check failed:", error);
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
      setIsSigningIn(false);
      return "ok";
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

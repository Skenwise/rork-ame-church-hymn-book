import { router } from "expo-router";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  premiumUnlocked: boolean;
}

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (snap) => {
          const data = snap.data();
          setUser({
            userId: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            premiumUnlocked: data?.premiumUnlocked || false,
          });
          setIsLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check if a pending unlock exists for this email
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

  const signIn = async (email: string, password: string) => {
    setIsSigningIn(true);
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      // Check pending unlock on every sign in too
      await checkPendingUnlock(email, firebaseUser.uid);
      router.replace("/");
    } catch (error: any) {
      console.error("[Auth] Sign in failed:", error);
      Alert.alert("Error", "Invalid email or password. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
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
          Alert.alert("Account Exists", "This email is already registered. Please sign in instead.");
          router.push("/sign-in");
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
    await firebaseSignOut(auth);
    router.replace("/sign-in");
  };

  const signInWithGoogle = async () => {
    Alert.alert("Coming Soon", "Google sign-in will be available soon.");
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isSigningIn,
    isSigningUp,
  };
});
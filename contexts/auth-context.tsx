import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
}

interface StoredUser {
  email: string;
  password: string;
  displayName: string;
  userId: string;
}

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    loadAuth();
    loadOrCreateDeviceId();
  }, []);

  const loadAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem("auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrCreateDeviceId = async () => {
    try {
      let id = await AsyncStorage.getItem("device_id");
      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem("device_id", id);
      }
      setDeviceId(id);
    } catch (error) {
      console.error("Failed to load device ID:", error);
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem("auth_user");
    router.replace("/sign-in");
  };

  const signIn = async (email: string, password: string) => {
    setIsSigningIn(true);
    try {
      const usersData = await AsyncStorage.getItem("users_db");
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        Alert.alert("Error", "No account found with this email. Please sign up first.");
        return;
      }
      
      if (foundUser.password !== password) {
        Alert.alert("Error", "Incorrect password. Please try again.");
        return;
      }
      
      const authUser: AuthUser = {
        userId: foundUser.userId,
        email: foundUser.email,
        displayName: foundUser.displayName,
      };
      
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      router.replace("/");
    } catch (error) {
      console.error('[Auth] Sign in failed:', error);
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsSigningUp(true);
    try {
      const usersData = await AsyncStorage.getItem("users_db");
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        Alert.alert("Error", "An account with this email already exists. Please sign in instead.");
        return;
      }
      
      const newUser: StoredUser = {
        email,
        password,
        displayName,
        userId: Crypto.randomUUID(),
      };
      
      users.push(newUser);
      await AsyncStorage.setItem("users_db", JSON.stringify(users));
      
      const authUser: AuthUser = {
        userId: newUser.userId,
        email: newUser.email,
        displayName: newUser.displayName,
      };
      
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      router.replace("/");
    } catch (error) {
      console.error('[Auth] Sign up failed:', error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const signInWithGoogle = async () => {
    Alert.alert(
      "Google Sign-In",
      "Google authentication is available. To enable it, you'll need to configure OAuth credentials in the Google Cloud Console. For now, please use email and password to sign in.",
      [{ text: "OK" }]
    );
  };

  return {
    user,
    isLoading,
    deviceId,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isSigningIn,
    isSigningUp,
  };
});

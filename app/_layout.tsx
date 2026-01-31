import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppContext, useApp } from "@/contexts/app-context";
import { AuthContext, useAuth } from "@/contexts/auth-context";

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (!user && inAuthGroup) {
      router.replace("/sign-in");
    } else if (user && !inAuthGroup && segments[0] !== "unlock" && segments[0] !== "hymn" && segments[0] !== "sign-in" && segments[0] !== "sign-up" && segments[0] !== "settings") {
      router.replace("/");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  const { isDarkMode } = useApp();
  
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: isDarkMode ? "#1a1a1a" : "#F9F7F0",
        },
        headerTintColor: isDarkMode ? "#fff" : "#315482",
        headerTitleStyle: {
          color: isDarkMode ? "#fff" : "#315482",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="hymn/[id]" options={{ headerShown: false }} />
      <Stack.Screen 
        name="unlock" 
        options={{ 
          presentation: "modal", 
          headerTitle: "Unlock Full Access",
          headerStyle: {
            backgroundColor: isDarkMode ? "#1a1a1a" : "#F9F7F0",
          },
          headerTintColor: isDarkMode ? "#fff" : "#315482",
          headerTitleStyle: {
            color: isDarkMode ? "#fff" : "#315482",
            fontWeight: "600",
          },
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthContext>
      <AppContext>
        <GestureHandlerRootView>
          <AuthGuard>
            <RootLayoutNav />
          </AuthGuard>
        </GestureHandlerRootView>
      </AppContext>
    </AuthContext>
  );
}

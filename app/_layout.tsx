import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View, StyleSheet, Image, Animated, Platform, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppContext, useApp } from "@/contexts/app-context";
import { AuthContext, useAuth } from "@/contexts/auth-context";
import { PurchasesContext } from "@/contexts/purchases-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function LoadingScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={loadingStyles.container}>
      <Animated.View 
        style={[
          loadingStyles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={loadingStyles.logoContainer}>
          <Image
            source={require("../assets/images/icon.png")}
            style={loadingStyles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={loadingStyles.titleContainer}>
          <Text style={loadingStyles.title}>AME Church</Text>
          <Text style={loadingStyles.subtitle}>Hymn Book</Text>
        </View>
      </Animated.View>
    </View>
  );
}

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
    return <LoadingScreen />;
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

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F7F0",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#315482",
    marginBottom: 28,
  },
  logo: {
    width: 140,
    height: 140,
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "700" as const,
    color: "#315482",
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: "center",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "300" as const,
    color: "#5A7BA0",
    letterSpacing: 2.5,
    textAlign: "center",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-light",
      },
    }),
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    if (Platform.OS === 'web') {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('Unable to activate keep awake')) {
          return;
        }
        originalConsoleError(...args);
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext>
        <PurchasesContext>
          <AppContext>
            <GestureHandlerRootView>
              <AuthGuard>
                <RootLayoutNav />
              </AuthGuard>
            </GestureHandlerRootView>
          </AppContext>
        </PurchasesContext>
      </AuthContext>
    </QueryClientProvider>
  );
}

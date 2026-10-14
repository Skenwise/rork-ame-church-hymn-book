import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/auth-context";

export default function AuthCallback() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { completeWebHandoff } = useAuth();
  const [statusText, setStatusText] = useState("Signing you in…");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    (async () => {
      try {
        if (token) {
          setStatusText("Signing you in…");
          const status = await completeWebHandoff(String(token));
          if (status === "limit") {
            router.replace("/device-limit");
            return;
          }
          setStatusText("Activating your hymns…");
        }
        router.replace("/(tabs)/(home)");
      } catch (error) {
        // Graceful fallback: never dead-end the user on this screen.
        console.error("[AuthCallback] Web handoff failed:", error);
        router.replace("/(tabs)/(home)");
      }
    })();
  }, [token, completeWebHandoff, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E31B23" />
      <Text style={styles.text}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F7F0",
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: "#315482",
    fontWeight: "500",
  },
});

import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { XCircle, RefreshCw } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";

const SIGN_IN_URL = "https://17thdistrictrayac.org/sign-in?source=app";

type Phase = "working" | "no-token" | "error";

export default function AuthCallback() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { completeWebHandoff } = useAuth();
  const [phase, setPhase] = useState<Phase>("working");
  const [statusText, setStatusText] = useState("Signing you in…");
  const processed = useRef(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Re-runs when the user taps "Try Again" (attempt changes).
    setPhase("working");
    setStatusText("Signing you in…");
    processed.current = false;

    (async () => {
      try {
        if (!token) {
          setPhase("no-token");
          return;
        }
        if (processed.current) return;
        processed.current = true;

        setStatusText("Signing you in…");
        const status = await completeWebHandoff(String(token));
        if (status === "limit") {
          router.replace("/device-limit");
          return;
        }
        if (status === "error") {
          setPhase("error");
          setStatusText(
            "Your hymns are paid for, but we couldn't reach our servers to finish setting up this phone. Please check your internet connection and try again."
          );
          return;
        }
        setStatusText("Activating your hymns…");
        router.replace("/(tabs)/(home)");
      } catch (error) {
        // Visible failure — never silently dump the user as a guest.
        console.error("[AuthCallback] Web handoff failed:", error);
        setPhase("error");
      }
    })();
  }, [token, completeWebHandoff, router, attempt]);

  if (phase === "no-token" || phase === "error") {
    const message =
      phase === "no-token"
        ? "No sign-in token arrived in the app. This can happen if an older app version opened the link."
        : statusText ||
          "We couldn't finish signing you in. Please check your internet connection and try again.";
    return (
      <View style={styles.container}>
        <XCircle size={56} color="#DC2626" />
        <Text style={styles.errorTitle}>
          {phase === "no-token" ? "Sign-in link incomplete" : "Sign-in failed"}
        </Text>
        <Text style={styles.errorBody}>{message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setAttempt((a) => a + 1)}
          disabled={phase === "no-token"}
        >
          <RefreshCw size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => Linking.openURL(SIGN_IN_URL)}>
          <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.replace("/(tabs)/(home)")}>
          <Text style={styles.linkButtonText}>Continue as guest</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
    gap: 14,
    paddingHorizontal: 32,
  },
  text: {
    fontSize: 16,
    color: "#315482",
    fontWeight: "500",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  errorBody: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E31B23",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#315482",
  },
  secondaryButtonText: {
    color: "#315482",
    fontSize: 15,
    fontWeight: "600",
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    color: "#6B7280",
    fontSize: 14,
  },
});

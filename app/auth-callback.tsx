import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { XCircle, RefreshCw } from "lucide-react-native";
import { useAuth } from "@/contexts/auth-context";
import { SIGN_IN_URL, openExternal } from "@/lib/app-links";

type Phase = "working" | "no-token" | "error" | "expired";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const { completeWebHandoff } = useAuth();
  const [phase, setPhase] = useState<Phase>("working");
  const [statusText, setStatusText] = useState("Signing you in…");
  const handoffRef = useRef(completeWebHandoff);
  useEffect(() => { handoffRef.current = completeWebHandoff; }, [completeWebHandoff]);
  const [attempt, setAttempt] = useState(0);
  const processedKey = useRef<string | null>(null);

  useEffect(() => {
    const key = `${token ?? "none"}:${attempt}`;
    if (processedKey.current === key) return;
    processedKey.current = key;

    // Re-runs only when the token changes or the user taps "Try Again".
    setPhase("working");
    setStatusText("Signing you in…");

    (async () => {
      try {
        console.log("[handoff] auth-callback token:", token ? "present" : "missing");
        if (!token) {
          setPhase("no-token");
          return;
        }

        setStatusText("Signing you in…");
        console.log("[handoff] signing in…");
        const status = await handoffRef.current(String(token));
        console.log("[handoff] result:", status);
        if (status === "limit") {
          router.replace("/device-limit");
          return;
        }
        if (status === "error") {
          setPhase("error");
          setStatusText(
            "We couldn't finish setting up this phone. Please check your internet connection and try again."
          );
          return;
        }
        setStatusText("Activating your hymns…");
        router.replace("/(tabs)/(home)");
      } catch (error: any) {
        const code = error?.code;
        console.error("[handoff] failed:", code || error);
        if (code === "auth/invalid-custom-token" || code === "auth/custom-token-mismatch") {
          setPhase("expired");
          return;
        }
        if (code === "entitlement/sync-failed") {
          setStatusText(
            "Couldn't confirm your membership. Please check your internet connection and tap Try Again. We only need this once — after that the app stays unlocked offline."
          );
          setPhase("error");
          return;
        }
        setStatusText(
          "We couldn't finish signing you in. Please check your internet connection and try again."
        );
        setPhase("error");
      }
    })();
  }, [token, attempt, router]);

  if (phase === "no-token" || phase === "error" || phase === "expired") {
    const isNoToken = phase === "no-token";
    const isExpired = phase === "expired";
    const message = isNoToken
      ? "No sign-in token arrived in the app. Please go back to the website and tap 'Return to the app'."
      : isExpired
        ? "This sign-in link has expired. Please sign in again on our website."
        : statusText ||
          "We couldn't finish signing you in. Please check your internet connection and try again.";
    const title = isNoToken
      ? "Sign-in link incomplete"
      : isExpired
        ? "Sign-in link expired"
        : "Sign-in failed";

    return (
      <View style={styles.container}>
        <XCircle size={56} color="#DC2626" />
        <Text style={styles.errorTitle}>{title}</Text>
        <Text style={styles.errorBody}>{message}</Text>

        {phase === "error" && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setAttempt((a) => a + 1)}
          >
            <RefreshCw size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={isNoToken || isExpired ? styles.retryButton : styles.secondaryButton}
          onPress={() => void openExternal(SIGN_IN_URL)}
        >
          <Text style={isNoToken || isExpired ? styles.retryButtonText : styles.secondaryButtonText}>
            {isNoToken ? "Sign In" : "Open Website"}
          </Text>
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

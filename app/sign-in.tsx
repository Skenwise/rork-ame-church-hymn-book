import { router, Stack } from "expo-router";
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";

export default function SignInScreen() {
  const { isDarkMode: isDark } = useApp();
  const { signIn, sendPasswordReset, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // After a successful sign-in we hold a brief "unlocking" state until the
  // account document lands, so the locked "Members Only" screen never flashes
  // in front of a paying member. The timeout guarantees we never strand them.
  useEffect(() => {
    if (!unlocking) return;
    if (user) {
      router.replace("/(tabs)/(home)");
      return;
    }
    const timer = setTimeout(() => router.replace("/(tabs)/(home)"), 6000);
    return () => clearTimeout(timer);
  }, [unlocking, user]);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      if (result === "ok") {
        setUnlocking(true);
      } else if (result === "no-account") {
        setErrorMessage("No account found for that email. Create one on our website.");
      } else {
        setErrorMessage("Sign in failed. Please check your email/password and try again.");
      }
    } catch {
      setErrorMessage("Sign in failed. Please check your email/password and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Enter Email", "Please enter your email address first to reset your password.");
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      Alert.alert("Check Email", "Check your email for a reset link.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not send password reset email. Please try again.");
    }
  };

  if (unlocking) {
    return (
      <SafeAreaView
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
        edges={["top"]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.unlockingContainer}>
          <ActivityIndicator size="large" color={colors.crimson} />
          <Text style={[styles.unlockingText, isDark ? styles.textDark : styles.textLight]}>
            Unlocking your hymns…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/(home)"))}
            >
              <ArrowLeft size={24} color={isDark ? colors.dark.text : colors.light.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <View style={styles.logoBadge}>
              <LogIn size={32} color={colors.white} />
            </View>
            <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
              Sign in to access your AME Hymn Book account
            </Text>
          </View>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>
                Email Address
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textDark : styles.textLight,
                ]}
                placeholder="your.email@example.com"
                placeholderTextColor={isDark ? colors.dark.textSecondary : colors.light.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.textDark : styles.textLight]}>
                Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    isDark ? styles.inputDark : styles.inputLight,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={isDark ? colors.dark.textSecondary : colors.light.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
                  ) : (
                    <Eye size={20} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
              <Text style={styles.forgotButtonText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, isDark ? styles.subtextDark : styles.subtextLight]}>
              New here?{" "}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL("https://17thdistrictrayac.org/join")}>
              <Text style={styles.footerLinkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  unlockingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  unlockingText: { fontSize: 16, fontWeight: "500" as const, textAlign: "center" },
  containerLight: { backgroundColor: colors.light.background },
  containerDark: { backgroundColor: colors.dark.background },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerRow: { marginBottom: 12 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: { alignItems: "center", marginBottom: 24 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.churchBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: "700" as const, marginBottom: 6, textAlign: "center" },
  subtitle: { fontSize: 15, textAlign: "center", paddingHorizontal: 20 },
  errorBanner: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorBannerText: { color: colors.error, fontSize: 14, textAlign: "center", fontWeight: "500" as const },
  card: { borderRadius: 16, padding: 20, marginBottom: 24 },
  cardLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDark: { backgroundColor: colors.dark.surface },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600" as const, marginBottom: 8 },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputLight: {
    backgroundColor: colors.light.background,
    borderColor: colors.light.border,
  },
  inputDark: {
    backgroundColor: colors.dark.background,
    borderColor: colors.dark.border,
  },
  passwordContainer: { flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1 },
  eyeButton: { position: "absolute", right: 16, height: "100%", justifyContent: "center" },
  forgotButton: { alignSelf: "flex-end", marginBottom: 20 },
  forgotButtonText: { color: colors.churchBlue, fontSize: 14, fontWeight: "600" as const },
  submitButton: {
    backgroundColor: colors.crimson,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: "700" as const },
  footerContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" },
  footerText: { fontSize: 15 },
  footerLinkText: { color: colors.churchBlue, fontSize: 15, fontWeight: "600" as const },
  textLight: { color: colors.light.text },
  textDark: { color: colors.dark.text },
  subtextLight: { color: colors.light.textSecondary },
  subtextDark: { color: colors.dark.textSecondary },
});

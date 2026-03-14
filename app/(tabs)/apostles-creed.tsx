import { Stack } from "expo-router";
import { Lock, LogIn } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  APOSTLES_CREED_ENGLISH,
  APOSTLES_CREED_BEMBA,
} from "@/constants/apostles-creed";
import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";

type Language = "english" | "bemba";

const FREE_PREVIEW_LINES = 2;

export default function ApostlesCreedScreen() {
  const { isDarkMode: isDark, textScale, isPaid } = useApp();
  const [language, setLanguage] = useState<Language>("english");

  const rawContent =
    language === "english" ? APOSTLES_CREED_ENGLISH : APOSTLES_CREED_BEMBA;

  const lines = rawContent.split("\n").filter((l) => l.trim().length > 0);

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          Apostles' Creed
        </Text>
      </View>

      <View style={styles.languageToggleContainer}>
        <TouchableOpacity
          style={[styles.languageButton, isDark ? styles.languageButtonDark : styles.languageButtonLight, language === "english" && styles.languageButtonActive]}
          onPress={() => setLanguage("english")}
        >
          <Text style={[styles.languageButtonText, isDark ? styles.languageButtonTextDark : styles.languageButtonTextLight, language === "english" && styles.languageButtonTextActive]}>
            English
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.languageButton, isDark ? styles.languageButtonDark : styles.languageButtonLight, language === "bemba" && styles.languageButtonActive]}
          onPress={() => setLanguage("bemba")}
        >
          <Text style={[styles.languageButtonText, isDark ? styles.languageButtonTextDark : styles.languageButtonTextLight, language === "bemba" && styles.languageButtonTextActive]}>
            Bemba
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.creedCard}>
          {lines.map((line, index) => {
            const isLocked = !isPaid && index >= FREE_PREVIEW_LINES;

            return (
              <View key={index}>
                <Text
                  style={[
                    styles.creedText,
                    isDark ? styles.textDark : styles.textLight,
                    { fontSize: Math.round(19 * textScale), lineHeight: Math.round(34 * textScale) },
                    isLocked && styles.lineBlurred,
                  ]}
                >
                  {line}
                </Text>

                {!isPaid && index === FREE_PREVIEW_LINES && (
                  <View style={[styles.lockOverlay, isDark ? styles.lockOverlayDark : styles.lockOverlayLight]}>
                    <View style={styles.lockIconContainer}>
                      <Lock size={32} color={colors.crimson} />
                    </View>
                    <Text style={[styles.lockTitle, isDark ? styles.textDark : styles.textLight]}>
                      Members Only
                    </Text>
                    <Text style={[styles.lockSubtext, isDark ? styles.subtextDark : styles.subtextLight]}>
                      Sign in to read the full Apostles' Creed
                    </Text>
                    <TouchableOpacity
                      style={styles.signInButton}
                      onPress={() => Linking.openURL("https://17thdistrictrayac.org/sign-in")}
                    >
                      <LogIn size={16} color={colors.white} />
                      <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.joinButton, isDark ? styles.joinButtonDark : styles.joinButtonLight]}
                      onPress={() => Linking.openURL("https://17thdistrictrayac.org/join")}
                    >
                      <Text style={[styles.joinButtonText, isDark ? styles.textDark : styles.textLight]}>
                        Create Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: colors.light.background },
  containerDark: { backgroundColor: colors.dark.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 28, fontWeight: "700" as const },
  languageToggleContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20, gap: 12 },
  languageButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", borderWidth: 1 },
  languageButtonLight: { borderColor: colors.light.border, backgroundColor: colors.light.surface },
  languageButtonDark: { borderColor: colors.dark.border, backgroundColor: colors.dark.surface },
  languageButtonActive: { backgroundColor: "#E31B23", borderColor: "#E31B23" },
  languageButtonText: { fontSize: 16, fontWeight: "600" as const },
  languageButtonTextLight: { color: colors.light.text },
  languageButtonTextDark: { color: colors.dark.textSecondary },
  languageButtonTextActive: { color: colors.white, fontWeight: "700" as const },
  content: { flex: 1, paddingHorizontal: 20 },
  creedCard: { alignItems: "center", paddingVertical: 20 },
  creedText: { fontSize: 19, lineHeight: 34, textAlign: "center", marginBottom: 4 },
  lineBlurred: { opacity: 0.15 },
  textLight: { color: colors.light.text },
  textDark: { color: colors.dark.text },
  subtextLight: { color: colors.light.textSecondary },
  subtextDark: { color: colors.dark.textSecondary },
  lockOverlay: { borderRadius: 16, padding: 24, alignItems: "center", marginVertical: 16, borderWidth: 1, width: "100%" },
  lockOverlayLight: { backgroundColor: colors.light.surface, borderColor: "rgba(227,27,35,0.15)" },
  lockOverlayDark: { backgroundColor: colors.dark.surface, borderColor: "rgba(227,27,35,0.15)" },
  lockIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(227,27,35,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  lockTitle: { fontSize: 20, fontWeight: "700" as const, marginBottom: 8 },
  lockSubtext: { fontSize: 14, textAlign: "center", marginBottom: 20 },
  signInButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.crimson, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: "100%", marginBottom: 10 },
  signInButtonText: { color: colors.white, fontSize: 16, fontWeight: "600" as const },
  joinButton: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, width: "100%", alignItems: "center", borderWidth: 1 },
  joinButtonLight: { borderColor: "#E4E4E7", backgroundColor: colors.light.background },
  joinButtonDark: { borderColor: "rgba(255,255,255,0.15)", backgroundColor: "transparent" },
  joinButtonText: { fontSize: 15, fontWeight: "600" as const },
  bottomPadding: { height: 40 },
});
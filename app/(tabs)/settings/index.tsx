import { Stack } from "expo-router";
import { Moon, Sun, Type, LogOut, User } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { TextScale } from "@/types/hymn";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { textScale, updateTextScale, isDarkMode, toggleDarkMode, isPaid } = useApp();
  const isDark = isDarkMode;

  const textScales: TextScale[] = [0.85, 1.0, 1.2, 1.4];

  const textScaleLabels: Record<TextScale, string> = {
    0.85: "Small",
    1.0: "Medium",
    1.2: "Large",
    1.4: "Extra Large",
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
            Settings
          </Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.subtextDark : styles.subtextLight]}>
            ACCOUNT
          </Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.accountInfo}>
              <View style={styles.avatar}>
                <User size={24} color={colors.white} />
              </View>
              <View style={styles.accountDetails}>
                <Text style={[styles.accountName, isDark ? styles.textDark : styles.textLight]}>
                  {user?.displayName || "Guest"}
                </Text>
                <Text style={[styles.accountEmail, isDark ? styles.subtextDark : styles.subtextLight]}>
                  {user?.email || "Not signed in"}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: isPaid ? colors.professionalBlue : colors.crimson }]}>
                  <Text style={styles.statusText}>
                    {isPaid ? "✦ Premium" : "Free Preview"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.subtextDark : styles.subtextLight]}>
            APPEARANCE
          </Text>

          {/* Dark Mode */}
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                {isDark ? (
                  <Moon size={20} color={isDark ? colors.dark.text : colors.light.primary} />
                ) : (
                  <Sun size={20} color={isDark ? colors.dark.text : colors.light.primary} />
                )}
                <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                  Dark Mode
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleDarkMode()}
                style={[
                  styles.toggle,
                  { backgroundColor: isDark ? colors.actionBlue : colors.borderGray }
                ]}
              >
                <View style={[
                  styles.toggleThumb,
                  { alignSelf: isDark ? "flex-end" : "flex-start" }
                ]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Font Size */}
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, styles.cardMargin]}>
            <View style={styles.settingColumn}>
              <View style={styles.settingLeft}>
                <Type size={20} color={isDark ? colors.dark.text : colors.light.primary} />
                <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                  Font Size
                </Text>
              </View>
              <View style={styles.fontSizeOptions}>
                {textScales.map((scale) => (
                  <TouchableOpacity
                    key={scale}
                    style={[
                      styles.fontSizeButton,
                      isDark ? styles.fontSizeButtonDark : styles.fontSizeButtonLight,
                      textScale === scale && styles.fontSizeButtonActive,
                    ]}
                    onPress={() => updateTextScale(scale)}
                  >
                    <Text
                      style={[
                        styles.fontSizeButtonText,
                        isDark && textScale !== scale && styles.fontSizeButtonTextDark,
                        textScale === scale && styles.fontSizeButtonTextActive,
                      ]}
                    >
                      {textScaleLabels[scale]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.subtextDark : styles.subtextLight]}>
            SESSION
          </Text>
          <TouchableOpacity
            style={[
              styles.card,
              styles.signOutCard,
              isDark ? styles.signOutCardDark : styles.signOutCardLight,
            ]}
            onPress={signOut}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark ? styles.subtextDark : styles.subtextLight]}>
            African Methodist Episcopal Church Hymns v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: colors.light.background },
  containerDark: { backgroundColor: colors.dark.background },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  headerTitle: { fontSize: 28, fontWeight: "700" as const },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  card: { borderRadius: 14, padding: 16 },
  cardLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: { backgroundColor: colors.dark.surface },
  cardMargin: { marginTop: 10 },
  accountInfo: { flexDirection: "row", gap: 16, alignItems: "center" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.churchBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  accountDetails: { flex: 1 },
  accountName: { fontSize: 17, fontWeight: "600" as const, marginBottom: 3 },
  accountEmail: { fontSize: 13, marginBottom: 8 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: { color: colors.white, fontSize: 12, fontWeight: "600" as const },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingColumn: { gap: 16 },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { fontSize: 16, fontWeight: "500" as const },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  fontSizeOptions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  fontSizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  fontSizeButtonLight: {
    borderColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  fontSizeButtonDark: {
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.background,
  },
  fontSizeButtonActive: {
    backgroundColor: colors.professionalBlue,
    borderColor: colors.professionalBlue,
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.mediumGray,
  },
  fontSizeButtonTextDark: { color: colors.dark.text },
  fontSizeButtonTextActive: { color: colors.white, fontWeight: "600" as const },
  signOutCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  signOutCardLight: { backgroundColor: "#fff1f0" },
  signOutCardDark: { backgroundColor: "#2a1a1a" },
  signOutText: { fontSize: 16, fontWeight: "600" as const, color: colors.error },
  footer: { alignItems: "center", paddingVertical: 32 },
  footerText: { fontSize: 13 },
  textLight: { color: colors.light.text },
  textDark: { color: colors.dark.text },
  subtextLight: { color: colors.light.textSecondary },
  subtextDark: { color: colors.dark.textSecondary },
});
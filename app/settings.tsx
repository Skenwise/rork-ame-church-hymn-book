import { Stack } from "expo-router";
import { Moon, Sun, Type, LogOut, User } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { FontSize } from "@/types/hymn";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { fontSize, updateFontSize, isDarkMode, toggleDarkMode, isPaid } = useApp();
  const isDark = isDarkMode;

  const fontSizes: FontSize[] = ["small", "medium", "large", "xlarge"];

  const fontSizeLabels: Record<FontSize, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    xlarge: "Extra Large",
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
            Account
          </Text>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.accountInfo}>
              <View style={styles.avatar}>
                <User size={24} color="#fff" />
              </View>
              <View style={styles.accountDetails}>
                <Text style={[styles.accountName, isDark ? styles.textDark : styles.textLight]}>
                  {user?.displayName || "User"}
                </Text>
                <Text style={[styles.accountEmail, isDark ? styles.subtextDark : styles.subtextLight]}>
                  {user?.email}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {isPaid ? "Premium" : "Free Preview"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
            Appearance
          </Text>
          
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                {isDarkMode ? (
                  <Moon size={20} color={isDark ? "#fff" : "#1A237E"} />
                ) : (
                  <Sun size={20} color={isDark ? "#fff" : "#1A237E"} />
                )}
                <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, styles.cardMargin]}>
            <View style={styles.settingColumn}>
              <View style={styles.settingLeft}>
                <Type size={20} color={isDark ? "#fff" : "#1A237E"} />
                <Text style={[styles.settingLabel, isDark ? styles.textDark : styles.textLight]}>
                  Font Size
                </Text>
              </View>
              <View style={styles.fontSizeOptions}>
                {fontSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeButton,
                      fontSize === size && styles.fontSizeButtonActive,
                      isDark ? styles.fontSizeButtonDark : styles.fontSizeButtonLight,
                    ]}
                    onPress={() => updateFontSize(size)}
                  >
                    <Text
                      style={[
                        styles.fontSizeButtonText,
                        fontSize === size && styles.fontSizeButtonTextActive,
                        isDark && fontSize !== size && styles.fontSizeButtonTextDark,
                      ]}
                    >
                      {fontSizeLabels[size]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.card,
              styles.signOutCard,
              isDark ? styles.signOutCardDark : styles.signOutCardLight,
            ]}
            onPress={signOut}
          >
            <LogOut size={20} color="#DC2626" />
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
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#FAFAFA",
  },
  containerDark: {
    backgroundColor: "#1a1a1a",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  cardLight: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: "#2a2a2a",
  },
  cardMargin: {
    marginTop: 12,
  },
  accountInfo: {
    flexDirection: "row",
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#5281BD",
    alignItems: "center",
    justifyContent: "center",
  },
  accountDetails: {
    flex: 1,
    justifyContent: "center",
  },
  accountName: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingColumn: {
    gap: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  fontSizeOptions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  fontSizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  fontSizeButtonLight: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  fontSizeButtonDark: {
    borderColor: "#444",
    backgroundColor: "#1a1a1a",
  },
  fontSizeButtonActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  fontSizeButtonTextDark: {
    color: "#fff",
  },
  fontSizeButtonTextActive: {
    color: "#fff",
  },
  signOutCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  signOutCardLight: {
    backgroundColor: "#fff1f0",
  },
  signOutCardDark: {
    backgroundColor: "#2a1a1a",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#DC2626",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
  },
  textLight: {
    color: "#212121",
  },
  textDark: {
    color: "#fff",
  },
  subtextLight: {
    color: "#6B7280",
  },
  subtextDark: {
    color: "#aaa",
  },
});

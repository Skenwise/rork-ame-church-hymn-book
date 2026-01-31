import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CALL_TO_WORSHIP_ENGLISH,
  CALL_TO_WORSHIP_BEMBA,
} from "@/constants/call-to-worship";
import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";

type Language = "english" | "bemba";

export default function CallToWorshipScreen() {
  const { isDarkMode: isDark } = useApp();
  const [language, setLanguage] = useState<Language>("english");

  const content =
    language === "english" ? CALL_TO_WORSHIP_ENGLISH : CALL_TO_WORSHIP_BEMBA;

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          Call to Worship
        </Text>
      </View>

      <View style={styles.languageToggleContainer}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            language === "english" && styles.languageButtonActive,
            isDark ? styles.languageButtonDark : styles.languageButtonLight,
          ]}
          onPress={() => setLanguage("english")}
        >
          <Text
            style={[
              styles.languageButtonText,
              language === "english" && styles.languageButtonTextActive,
              isDark && language !== "english" && styles.languageButtonTextDark,
            ]}
          >
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.languageButton,
            language === "bemba" && styles.languageButtonActive,
            isDark ? styles.languageButtonDark : styles.languageButtonLight,
          ]}
          onPress={() => setLanguage("bemba")}
        >
          <Text
            style={[
              styles.languageButtonText,
              language === "bemba" && styles.languageButtonTextActive,
              isDark && language !== "bemba" && styles.languageButtonTextDark,
            ]}
          >
            Bemba
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {content.map((line, index) => (
          <View key={index} style={styles.lineContainer}>
            <Text style={[styles.role, isDark ? styles.roleDark : styles.roleLight]}>
              {line.role}
            </Text>
            <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
              {line.text}
            </Text>
          </View>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: colors.light.background,
  },
  containerDark: {
    backgroundColor: colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  languageToggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  languageButtonLight: {
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  languageButtonDark: {
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
  },
  languageButtonActive: {
    backgroundColor: colors.churchBlue,
    borderColor: colors.churchBlue,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.mediumGray,
  },
  languageButtonTextDark: {
    color: colors.dark.textSecondary,
  },
  languageButtonTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lineContainer: {
    marginBottom: 24,
  },
  role: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  roleLight: {
    color: colors.light.primary,
  },
  roleDark: {
    color: colors.professionalBlue,
  },
  text: {
    fontSize: 17,
    lineHeight: 28,
  },
  textLight: {
    color: colors.light.text,
  },
  textDark: {
    color: colors.dark.text,
  },
  bottomPadding: {
    height: 40,
  },
});

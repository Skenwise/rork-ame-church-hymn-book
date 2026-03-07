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
  APOSTLES_CREED_ENGLISH,
  APOSTLES_CREED_BEMBA,
} from "@/constants/apostles-creed";
import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";

type Language = "english" | "bemba";

export default function ApostlesCreedScreen() {
  const { isDarkMode: isDark, textScale } = useApp();
  const [language, setLanguage] = useState<Language>("english");

  const content =
    language === "english" ? APOSTLES_CREED_ENGLISH : APOSTLES_CREED_BEMBA;

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.textDark : styles.textLight,
          ]}
        >
          Apostles&apos; Creed
        </Text>
      </View>

      <View style={styles.languageToggleContainer}>
        <TouchableOpacity
          style={[
            styles.languageButton,
            isDark ? styles.languageButtonDark : styles.languageButtonLight,
            language === "english" && styles.languageButtonActive,
          ]}
          onPress={() => setLanguage("english")}
        >
          <Text
            style={[
              styles.languageButtonText,
              isDark
                ? styles.languageButtonTextDark
                : styles.languageButtonTextLight,
              language === "english" && styles.languageButtonTextActive,
            ]}
          >
            English
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageButton,
            isDark ? styles.languageButtonDark : styles.languageButtonLight,
            language === "bemba" && styles.languageButtonActive,
          ]}
          onPress={() => setLanguage("bemba")}
        >
          <Text
            style={[
              styles.languageButtonText,
              isDark
                ? styles.languageButtonTextDark
                : styles.languageButtonTextLight,
              language === "bemba" && styles.languageButtonTextActive,
            ]}
          >
            Bemba
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.creedCard}>
          <Text
            style={[
              styles.creedText,
              isDark ? styles.textDark : styles.textLight,
              {
                fontSize: Math.round(19 * textScale),
                lineHeight: Math.round(34 * textScale),
              },
            ]}
          >
            {content}
          </Text>
        </View>
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
  },
  languageButtonTextLight: {
    color: colors.light.text,
  },
  languageButtonTextDark: {
    color: colors.dark.textSecondary,
  },
  languageButtonTextActive: {
    color: colors.white,
    fontWeight: "700" as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  creedCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  creedText: {
    fontSize: 19,
    lineHeight: 34,
    textAlign: "center",
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

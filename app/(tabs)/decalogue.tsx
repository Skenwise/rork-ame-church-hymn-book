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
  DECALOGUE_ENGLISH,
  DECALOGUE_BEMBA,
} from "@/constants/decalogue";
import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";

type Language = "english" | "bemba";

export default function DecalogueScreen() {
  const { isDarkMode: isDark, textScale } = useApp();
  const [language, setLanguage] = useState<Language>("english");

  const content =
    language === "english" ? DECALOGUE_ENGLISH : DECALOGUE_BEMBA;

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          Decalogue
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
              isDark ? styles.languageButtonTextDark : styles.languageButtonTextLight,
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
              isDark ? styles.languageButtonTextDark : styles.languageButtonTextLight,
              language === "bemba" && styles.languageButtonTextActive,
            ]}
          >
            Bemba
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {content.map((line, index) => (
          <View key={index} style={styles.lineContainer}>
            <Text
              style={[
                styles.role,
                isDark ? styles.roleDark : styles.roleLight,
                { fontSize: Math.round(16 * textScale) },
              ]}
            >
              {line.role}
            </Text>

            <Text
              style={[
                styles.text,
                isDark ? styles.textDark : styles.textLight,
                {
                  fontSize: Math.round(17 * textScale),
                  lineHeight: Math.round(28 * textScale),
                },
              ]}
            >
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
    borderColor: "transparent",
    backgroundColor: colors.light.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  languageButtonDark: {
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
  },
  languageButtonActive: {
    backgroundColor: "#E31B23",
    borderColor: "#E31B23",
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  languageButtonTextLight: {
    color: "#1A1A1A",
  },
  languageButtonTextDark: {
    color: colors.dark.textSecondary,
  },
  languageButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700" as const,
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
    color: colors.actionBlue,
  },
  roleDark: {
    color: colors.actionBlue,
  },
  text: {
    fontSize: 17,
    lineHeight: 28,
  },
  textLight: {
    color: "#1A1A1A",
  },
  textDark: {
    color: colors.dark.text,
  },
  bottomPadding: {
    height: 40,
  },
});
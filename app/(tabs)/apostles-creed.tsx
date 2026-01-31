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
import { useApp } from "@/contexts/app-context";

type Language = "english" | "bemba";

export default function ApostlesCreedScreen() {
  const { isDarkMode: isDark } = useApp();
  const [language, setLanguage] = useState<Language>("english");

  const content =
    language === "english" ? APOSTLES_CREED_ENGLISH : APOSTLES_CREED_BEMBA;

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          Apostles&apos; Creed
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
        <View style={styles.creedCard}>
          <Text style={[styles.creedText, isDark ? styles.textDark : styles.textLight]}>
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
    backgroundColor: "#F9F7F0",
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
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  languageButtonDark: {
    borderColor: "#444",
    backgroundColor: "#2a2a2a",
  },
  languageButtonActive: {
    backgroundColor: "#5281BD",
    borderColor: "#5281BD",
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  languageButtonTextDark: {
    color: "#D1D5DB",
  },
  languageButtonTextActive: {
    color: "#fff",
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
    color: "#1F2937",
  },
  textDark: {
    color: "#fff",
  },
  bottomPadding: {
    height: 40,
  },
});

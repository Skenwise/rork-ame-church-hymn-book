import { useLocalSearchParams, router, Stack } from "expo-router";
import { Heart, ArrowLeft, Lock } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";

type Language = "english" | "bemba";

export default function HymnDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fontSize, favorites, toggleFavorite, canAccessHymn, isDarkMode: isDark } = useApp();
  const [language, setLanguage] = useState<Language>("english");

  const hymn = HYMNS.find((h) => h.id === id);

  if (!hymn) {
    return (
      <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        <Text style={[styles.errorText, isDark ? styles.textDark : styles.textLight]}>
          Hymn not found
        </Text>
      </SafeAreaView>
    );
  }

  const hasBembaVersion = !!hymn.versesBemba && hymn.versesBemba.length > 0;
  const currentTitle = language === "bemba" && hymn.titleBemba ? hymn.titleBemba : hymn.title;
  const currentVerses = language === "bemba" && hymn.versesBemba ? hymn.versesBemba : hymn.verses;

  const hasAccess = canAccessHymn(hymn.number);
  const isFavorite = favorites.has(hymn.id);

  const fontSizeValues = {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 20,
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={isDark ? "#fff" : "#1A237E"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(hymn.id)}
        >
          <Heart
            size={24}
            color={isFavorite ? "#DC2626" : isDark ? "#fff" : "#1A237E"}
            fill={isFavorite ? "#DC2626" : "none"}
          />
        </TouchableOpacity>
      </View>

      {hasBembaVersion && hasAccess && (
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
      )}

      {!hasAccess ? (
        <View style={styles.lockedContainer}>
          <Lock size={64} color={isDark ? "#444" : "#ddd"} />
          <Text style={[styles.lockedTitle, isDark ? styles.textDark : styles.textLight]}>
            Premium Content
          </Text>
          <Text style={[styles.lockedText, isDark ? styles.subtextDark : styles.subtextLight]}>
            This hymn is part of the full collection. Unlock to access all hymns.
          </Text>
          <TouchableOpacity
            style={styles.unlockButtonLarge}
            onPress={() => router.push("/unlock")}
          >
            <Text style={styles.unlockButtonLargeText}>Unlock Full Access</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hymnHeader}>
            <View style={styles.hymnNumberBadge}>
              <Text style={styles.hymnNumberBadgeText}>#{hymn.number}</Text>
            </View>
            
            <Text style={[styles.hymnTitle, isDark ? styles.textDark : styles.textLight]}>
              {currentTitle}
            </Text>
            {hymn.author && (
              <Text style={[styles.hymnAuthor, isDark ? styles.subtextDark : styles.subtextLight]}>
                {hymn.author}
              </Text>
            )}
            {hymn.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{hymn.category}</Text>
              </View>
            )}
          </View>

          <View style={styles.lyricsContainer}>
            {currentVerses.map((verse, index) => {
              const lines = verse.split('\n').filter(line => line.trim());
              return (
                <View key={index} style={styles.verse}>
                  {lines.map((line, lineIndex) => (
                    <Text
                      key={lineIndex}
                      style={[
                        styles.verseText,
                        { fontSize: fontSizeValues[fontSize] },
                        isDark ? styles.textDark : styles.textLight,
                      ]}
                    >
                      {line}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
  },
  hymnHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  hymnNumberBadge: {
    backgroundColor: "#5281BD",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  hymnNumberBadgeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  hymnTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    textAlign: "center",
    marginBottom: 8,
  },
  hymnAuthor: {
    fontSize: 16,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  lyricsContainer: {
    gap: 24,
    alignItems: "center",
  },
  verse: {
    paddingHorizontal: 8,
    width: "100%",
  },
  verseText: {
    lineHeight: 28,
    textAlign: "center",
  },
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    marginTop: 24,
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  unlockButtonLarge: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unlockButtonLargeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
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
    borderColor: "#E5E7EB",
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
});

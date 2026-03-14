import { useLocalSearchParams, router, Stack } from "expo-router";
import { Heart, ArrowLeft, Lock, LogIn } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";

type Language = "english" | "bemba";

export default function HymnDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { textScale, favorites, toggleFavorite, canAccessHymn, isDarkMode: isDark } = useApp();
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


  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? colors.dark.text : colors.light.primary} />
        </TouchableOpacity>
        {hasAccess && (
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(hymn.id)}>
            <Heart
              size={24}
              color={isFavorite ? colors.error : isDark ? colors.dark.text : colors.light.primary}
              fill={isFavorite ? colors.error : "none"}
            />
          </TouchableOpacity>
        )}
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
              language === "bemba" && styles.languageButtonActive,
              isDark ? styles.languageButtonDark : styles.languageButtonLight,
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
      )}

      {!hasAccess ? (
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIconContainer}>
            <Lock size={48} color={colors.churchBlue} />
          </View>
          <Text style={[styles.lockedTitle, isDark ? styles.textDark : styles.textLight]}>
            Members Only
          </Text>
          <Text style={[styles.lockedText, isDark ? styles.subtextDark : styles.subtextLight]}>
            The full hymn library is available to registered members.
          </Text>
          <TouchableOpacity
            style={styles.signInButtonLarge}
            onPress={() => Linking.openURL("https://17thdistrictrayac.org/sign-in")}
          >
            <LogIn size={20} color={colors.white} />
            <Text style={styles.signInButtonLargeText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createAccountButton, isDark ? styles.createAccountButtonDark : styles.createAccountButtonLight]}
            onPress={() => Linking.openURL("https://17thdistrictrayac.org/join")}
          >
            <Text style={[styles.createAccountButtonText, isDark ? styles.textDark : styles.textLight]}>
              Create Account
            </Text>
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
              const lines = verse.split("\n").filter(line => line.trim());
              return (
                <View key={index} style={styles.verse}>
                  {lines.map((line, lineIndex) => (
                    <Text
                      key={lineIndex}
                      style={[
                        styles.verseText,
                        { fontSize: Math.round(16 * textScale), lineHeight: Math.round(28 * textScale) },
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
  container: { flex: 1 },
  containerLight: { backgroundColor: colors.light.background },
  containerDark: { backgroundColor: colors.dark.background },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  favoriteButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  content: { padding: 20 },
  hymnHeader: { alignItems: "center", marginBottom: 32 },
  hymnNumberBadge: { backgroundColor: colors.actionBlue, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  hymnNumberBadgeText: { fontSize: 14, fontWeight: "600" as const, color: colors.white },
  hymnTitle: { fontSize: 28, fontWeight: "700" as const, textAlign: "center", marginBottom: 8 },
  hymnAuthor: { fontSize: 16, marginBottom: 12 },
  categoryBadge: { backgroundColor: colors.actionBlue, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  categoryBadgeText: { color: colors.white, fontSize: 12, fontWeight: "600" as const },
  lyricsContainer: { gap: 24, alignItems: "center" },
  verse: { paddingHorizontal: 8, width: "100%" },
  verseText: { lineHeight: 28, textAlign: "center" },
  lockedContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  lockedIconContainer: { width: 88, height: 88, borderRadius: 44, backgroundColor: "rgba(227, 27, 35, 0.15)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  lockedTitle: { fontSize: 24, fontWeight: "700" as const, marginBottom: 12 },
  lockedText: { fontSize: 16, textAlign: "center", marginBottom: 32 },
  signInButtonLarge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.actionBlue, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14, width: "100%", maxWidth: 280, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  signInButtonLargeText: { color: colors.white, fontSize: 16, fontWeight: "600" as const },
  createAccountButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: "100%", maxWidth: 280, alignItems: "center", borderWidth: 1 },
  createAccountButtonLight: { borderColor: "#E4E4E7", backgroundColor: colors.light.surface },
  createAccountButtonDark: { borderColor: "rgba(255, 255, 255, 0.25)", backgroundColor: "transparent" },
  createAccountButtonText: { fontSize: 16, fontWeight: "600" as const },
  errorText: { fontSize: 18, textAlign: "center", marginTop: 40 },
  textLight: { color: "#1A1A1A" },
  textDark: { color: colors.dark.text },
  subtextLight: { color: "#1A1A1A" },
  subtextDark: { color: colors.dark.textSecondary },
  languageToggleContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20, gap: 12 },
  languageButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", borderWidth: 1 },
  languageButtonLight: { borderColor: "transparent", backgroundColor: colors.light.surface, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  languageButtonDark: { borderColor: colors.dark.border, backgroundColor: colors.dark.surface },
  languageButtonActive: { backgroundColor: colors.actionBlue, borderColor: colors.actionBlue, opacity: 1 },
  languageButtonText: { fontSize: 16, fontWeight: "600" as const },
  languageButtonTextLight: { color: "#1A1A1A" },
  languageButtonTextDark: { color: colors.dark.textSecondary },
  languageButtonTextActive: { color: "#FFFFFF", fontWeight: "700" as const },
});

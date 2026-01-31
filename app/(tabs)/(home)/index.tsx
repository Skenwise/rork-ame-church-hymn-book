import { router, Stack } from "expo-router";
import { Search, Crown, Settings, Church, Languages } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";

export default function HomeScreen() {
  const { isPaid, canAccessHymn, isDarkMode: isDark, language, toggleLanguage } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHymns = useMemo(() => {
    if (!searchQuery.trim()) return HYMNS;

    const query = searchQuery.toLowerCase();
    return HYMNS.filter(
      (hymn) =>
        hymn.title.toLowerCase().includes(query) ||
        (hymn.titleBemba && hymn.titleBemba.toLowerCase().includes(query)) ||
        hymn.number.toString().includes(query) ||
        (hymn.lyrics && hymn.lyrics.toLowerCase().includes(query)) ||
        (hymn.lyricsBemba && hymn.lyricsBemba.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const renderHymnItem = ({ item }: { item: typeof HYMNS[0] }) => {
    const hasAccess = canAccessHymn(item.number);
    const displayTitle = language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

    return (
      <TouchableOpacity
        style={[styles.hymnCard, isDark ? styles.hymnCardDark : styles.hymnCardLight]}
        onPress={() => router.push(`/hymn/${item.id}`)}
        disabled={!hasAccess}
      >
        <View style={styles.hymnCardContent}>
          <View style={styles.hymnNumber}>
            <Text style={[styles.hymnNumberText, isDark ? styles.textDark : styles.textLight]}>
              {item.number}
            </Text>
          </View>
          <View style={styles.hymnInfo}>
            <Text style={[styles.hymnTitle, isDark ? styles.textDark : styles.textLight]}>
              {displayTitle}
            </Text>
            {item.category && (
              <Text style={[styles.hymnCategory, isDark ? styles.subtextDark : styles.subtextLight]}>
                {item.category}
              </Text>
            )}
          </View>
          {!hasAccess && (
            <View style={styles.lockBadge}>
              <Crown size={16} color={colors.warning} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.appNameContainer}>
          <View style={styles.appIconBadge}>
            <Church size={24} color={colors.white} />
          </View>
          <View style={styles.appNameTextContainer}>
            <Text style={[styles.appNameMain, isDark ? styles.textDark : styles.textLight]}>
              AME Church
            </Text>
            <Text style={[styles.appNameSub, isDark ? styles.appNameSubDark : styles.appNameSubLight]}>
              HYMNS
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
          >
            <Languages size={20} color={isDark ? colors.dark.text : colors.light.primary} />
            <Text style={[styles.languageButtonText, isDark ? styles.textDark : styles.textLight]}>
              {language === "english" ? "EN" : "BE"}
            </Text>
          </TouchableOpacity>
          {!isPaid && (
            <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/unlock")}>
              <Crown size={18} color={colors.white} />
              <Text style={styles.unlockButtonText}>Unlock</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
          >
            <Settings size={24} color={isDark ? colors.dark.text : colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
          <Search size={20} color={isDark ? "#666" : colors.mediumGray} />
          <TextInput
            style={[styles.searchInput, isDark ? styles.searchInputDark : styles.searchInputLight]}
            placeholder="Search hymns..."
            placeholderTextColor={isDark ? "#666" : colors.light.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {!isPaid && (
        <View style={styles.previewBanner}>
          <Text style={styles.previewBannerText}>
            Viewing first 10 hymns • Unlock for full access
          </Text>
        </View>
      )}

      <FlatList
        data={filteredHymns}
        renderItem={renderHymnItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  appNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.churchBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appNameTextContainer: {
    gap: -2,
  },
  appNameMain: {
    fontSize: 20,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  appNameSub: {
    fontSize: 16,
    fontWeight: "800" as const,
    letterSpacing: 2,
  },
  appNameSubLight: {
    color: colors.churchBlue,
  },
  appNameSubDark: {
    color: colors.professionalBlue,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsButton: {
    padding: 4,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },

  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unlockButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchBoxLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBoxDark: {
    backgroundColor: colors.dark.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchInputLight: {
    color: colors.light.text,
  },
  searchInputDark: {
    color: colors.dark.text,
  },
  previewBanner: {
    backgroundColor: colors.actionBlue,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  previewBannerText: {
    color: colors.white,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500" as const,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  hymnCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  hymnCardLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  hymnCardDark: {
    backgroundColor: colors.dark.surface,
  },
  hymnCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  hymnNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.churchBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  hymnNumberText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.white,
  },
  hymnInfo: {
    flex: 1,
  },
  hymnTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  hymnCategory: {
    fontSize: 14,
  },
  lockBadge: {
    padding: 8,
  },
  textLight: {
    color: colors.light.text,
  },
  textDark: {
    color: colors.dark.text,
  },
  subtextLight: {
    color: colors.light.textSecondary,
  },
  subtextDark: {
    color: colors.dark.textSecondary,
  },
});

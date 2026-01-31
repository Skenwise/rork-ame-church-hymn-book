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
              <Crown size={16} color="#F59E0B" />
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
            <Church size={24} color="#fff" />
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
            <Languages size={20} color={isDark ? "#fff" : "#1A237E"} />
            <Text style={[styles.languageButtonText, isDark ? styles.textDark : styles.textLight]}>
              {language === "english" ? "EN" : "BE"}
            </Text>
          </TouchableOpacity>
          {!isPaid && (
            <TouchableOpacity style={styles.unlockButton} onPress={() => router.push("/unlock")}>
              <Crown size={18} color="#fff" />
              <Text style={styles.unlockButtonText}>Unlock</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
          >
            <Settings size={24} color={isDark ? "#fff" : "#1A237E"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
          <Search size={20} color={isDark ? "#666" : "#6B7280"} />
          <TextInput
            style={[styles.searchInput, isDark ? styles.searchInputDark : styles.searchInputLight]}
            placeholder="Search hymns..."
            placeholderTextColor={isDark ? "#666" : "#9CA3AF"}
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
    backgroundColor: "#FAFAFA",
  },
  containerDark: {
    backgroundColor: "#1a1a1a",
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
    backgroundColor: "#5281BD",
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
    color: "#5281BD",
  },
  appNameSubDark: {
    color: "#4A90E2",
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
    backgroundColor: "#F59E0B",
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
    color: "#fff",
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBoxDark: {
    backgroundColor: "#2a2a2a",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchInputLight: {
    color: "#000",
  },
  searchInputDark: {
    color: "#fff",
  },
  previewBanner: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  previewBannerText: {
    color: "#fff",
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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  hymnCardDark: {
    backgroundColor: "#2a2a2a",
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
    backgroundColor: "#5281BD",
    alignItems: "center",
    justifyContent: "center",
  },
  hymnNumberText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
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

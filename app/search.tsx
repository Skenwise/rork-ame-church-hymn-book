import { Stack } from "expo-router";
import { Search, Heart, Filter, ChevronRight, Lock } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";
import { Hymn } from "@/types/hymn";

type FilterType = "all" | "favorites" | "category";

export default function SearchScreen() {
  const { isDarkMode: isDark, textScale, favorites } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const filteredHymns = useMemo(() => {
    let filtered: typeof HYMNS = [...HYMNS];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((hymn: Hymn) =>
          hymn.title.toLowerCase().includes(query) ||
          hymn.number.toString().includes(query) ||
          (hymn.category || "").toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case "favorites":
        filtered = filtered.filter((hymn: Hymn) => favorites.has(hymn.id));
        break;
      case "category":
        // For now, just show all - could be expanded to select specific category
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedFilter, favorites]);

  const renderHymnItem = ({ item }: { item: Hymn }) => {
    const isFavorite = favorites.has(item.id);
    const hasAccess = true; // placeholder; can integrate canAccessHymn from context when available

    return (
      <TouchableOpacity
        style={[styles.hymnRow, isDark ? styles.hymnRowDark : styles.hymnRowLight]}
        onPress={() => {
          // Navigate to hymn detail
        }}
      >
        <View style={styles.hymnLeft}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.number}</Text>
          </View>
          <View style={styles.hymnInfo}>
            <Text
              style={[
                styles.hymnTitle,
                isDark ? styles.textDark : styles.textLight,
                { fontSize: Math.round(16 * textScale) },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.hymnCategory,
                isDark ? styles.subtextDark : styles.subtextLight,
                { fontSize: Math.round(14 * textScale) },
              ]}
            >
              {item.category}
            </Text>
          </View>
        </View>
        <View style={styles.hymnRight}>
          {isFavorite && <Heart size={16} color={colors.error} fill={colors.error} />}
          {hasAccess ? (
            <ChevronRight size={16} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          ) : (
            <Lock size={16} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "favorites", label: "Favorites" },
    { key: "category", label: "Category" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          Search Hymns
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isDark ? styles.searchBarDark : styles.searchBarLight]}>
          <Search size={20} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          <TextInput
            style={[
              styles.searchInput,
              isDark ? styles.searchInputDark : styles.searchInputLight,
              { fontSize: Math.round(16 * textScale) },
            ]}
            placeholder="Search hymns..."
            placeholderTextColor={isDark ? colors.dark.textSecondary : colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterPill,
              selectedFilter === filter.key && styles.filterPillActive,
              isDark ? styles.filterPillDark : styles.filterPillLight,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === filter.key && styles.filterPillTextActive,
                isDark ? styles.filterPillTextDark : styles.filterPillTextLight,
                { fontSize: Math.round(14 * textScale) },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredHymns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHymnItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark ? styles.textDark : styles.textLight]}>
              No hymns found
            </Text>
          </View>
        }
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchBarLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  searchBarDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  searchInput: {
    flex: 1,
  },
  searchInputLight: {
    color: colors.light.text,
  },
  searchInputDark: {
    color: colors.dark.text,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillLight: {
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  filterPillDark: {
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
  },
  filterPillActive: {
    backgroundColor: colors.professionalBlue,
    borderColor: colors.professionalBlue,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  filterPillTextLight: {
    color: colors.light.textSecondary,
  },
  filterPillTextDark: {
    color: colors.dark.textSecondary,
  },
  filterPillTextActive: {
    color: colors.white,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hymnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  hymnRowLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  hymnRowDark: {
    backgroundColor: colors.dark.surface,
  },
  hymnLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.professionalBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700" as const,
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
  hymnRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mediumGray,
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
import { Stack, router } from "expo-router";
import { Heart, ChevronRight, Lock } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";

export default function FavoritesScreen() {
  const { favoriteHymns, isDarkMode: isDark, textScale, canAccessHymn } = useApp();

  const renderHymnItem = ({ item }: { item: typeof favoriteHymns[0] }) => {
    const isLocked = !canAccessHymn(item.number);

    return (
      <TouchableOpacity
        style={[styles.hymnRow, isDark ? styles.hymnRowDark : styles.hymnRowLight]}
        onPress={() => router.push(`/hymn/${item.id}`)}
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
          <Heart size={16} color={colors.error} fill={colors.error} />
          {isLocked ? (
            <Lock size={16} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          ) : (
            <ChevronRight size={16} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
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
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          Favorites
        </Text>
        <Text style={[styles.headerSubtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
          {favoriteHymns.length} {favoriteHymns.length === 1 ? "hymn" : "hymns"}
        </Text>
      </View>

      {favoriteHymns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={48} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          <Text style={[styles.emptyTitle, isDark ? styles.textDark : styles.textLight]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptyText, isDark ? styles.subtextDark : styles.subtextLight]}>
            Tap the heart icon on hymns to add them to your favorites
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteHymns}
          renderItem={renderHymnItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.mediumGray,
  },
  listContent: {
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
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
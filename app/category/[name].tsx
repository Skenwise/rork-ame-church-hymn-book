import { Stack, useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, ChevronRight, Lock } from "lucide-react-native";
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
import { HYMNS } from "@/mocks/hymns";
import { Hymn } from "@/types/hymn";

export default function CategoryScreen() {
  const { name: rawName } = useLocalSearchParams<{ name: string }>();
  const name = rawName ? decodeURIComponent(rawName) : "";
  const { isDarkMode: isDark, textScale, canAccessHymn } = useApp();

  const categoryHymns: typeof HYMNS = HYMNS.filter((hymn) => hymn.category === name);

  const renderHymnItem = ({ item }: { item: Hymn }) => {
    const hasAccess = canAccessHymn(item.number);

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
          </View>
        </View>
        <View style={styles.hymnRight}>
          {hasAccess ? (
            <ChevronRight size={16} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          ) : (
            <Lock size={16} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? colors.dark.text : colors.light.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
          {name}
        </Text>
        <Text style={[styles.headerSubtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
          {categoryHymns.length} {categoryHymns.length === 1 ? "hymn" : "hymns"}
        </Text>
      </View>

      {categoryHymns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDark ? styles.subtextDark : styles.subtextLight]}>
            No hymns found in this category.
          </Text>
        </View>
      ) : (
        <FlatList
          data={categoryHymns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHymnItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: colors.light.background },
  containerDark: { backgroundColor: colors.dark.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.mutedGray,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hymnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
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
    backgroundColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700" as const,
  },
  hymnInfo: { flex: 1 },
  hymnTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
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
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  textLight: { color: colors.light.text },
  textDark: { color: colors.dark.text },
  subtextLight: { color: colors.light.textSecondary },
  subtextDark: { color: colors.dark.textSecondary },
});
import { Stack, router } from "expo-router";
import { Heart } from "lucide-react-native";
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
  const { favoriteHymns, isDarkMode: isDark } = useApp();

  const renderHymnItem = ({ item }: { item: typeof favoriteHymns[0] }) => {
    return (
      <TouchableOpacity
        style={[styles.hymnCard, isDark ? styles.hymnCardDark : styles.hymnCardLight]}
        onPress={() => router.push(`/hymn/${item.id}`)}
      >
        <View style={styles.hymnCardContent}>
          <View style={styles.hymnNumber}>
            <Text style={[styles.hymnNumberText]}>
              {item.number}
            </Text>
          </View>
          <View style={styles.hymnInfo}>
            <Text style={[styles.hymnTitle, isDark ? styles.textDark : styles.textLight]}>
              {item.title}
            </Text>
            {item.category && (
              <Text style={[styles.hymnCategory, isDark ? styles.subtextDark : styles.subtextLight]}>
                {item.category}
              </Text>
            )}
          </View>
          <Heart size={20} color={colors.error} fill={colors.error} />
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
      </View>

      {favoriteHymns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color={isDark ? "#444" : colors.borderGray} />
          <Text style={[styles.emptyTitle, isDark ? styles.textDark : styles.textLight]}>
            No Favorites Yet
          </Text>
          <Text style={[styles.emptyText, isDark ? styles.subtextDark : styles.subtextLight]}>
            Tap the heart icon on any hymn to add it to your favorites
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

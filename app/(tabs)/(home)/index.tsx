import { router, Stack } from "expo-router";
import { Search, Crown, Settings, Church, Languages, ArrowUpAZ, Hash, LogIn, Sparkles, ChevronRight, Heart, BookOpen, Cross, Users, Star } from "lucide-react-native";
import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import colors from "@/constants/colors";
import { useApp } from "@/contexts/app-context";
import { HYMNS } from "@/mocks/hymns";

type SortType = "numerical" | "alphabetical";

const { width } = Dimensions.get("window");
const categoryCardWidth = (width - 40 - 12) / 2;

const categories: { name: string; icon: any; colors: [string, string] }[] = [
  { name: "Praise & Worship", icon: Church, colors: [colors.crimson, colors.professionalBlue] },
  { name: "Prayer & Devotion", icon: BookOpen, colors: [colors.amber, colors.crimson] },
  { name: "Faith & Trust", icon: Star, colors: [colors.professionalBlue, colors.churchBlue] },
  { name: "Love of God", icon: Heart, colors: [colors.error, colors.amber] },
  { name: "Christmas", icon: Sparkles, colors: [colors.linen, colors.amber] },
  { name: "Salvation", icon: Cross, colors: [colors.churchBlue, colors.professionalBlue] },
];

export default function HomeScreen() {
  const { isPaid, canAccessHymn, isDarkMode: isDark, language, toggleLanguage } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("numerical");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchHeightAnim = useRef(new Animated.Value(0)).current;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const toggleSearch = () => {
    const toValue = isSearchExpanded ? 0 : 56;
    Animated.spring(searchHeightAnim, {
      toValue,
      useNativeDriver: false,
    }).start();
    setIsSearchExpanded(!isSearchExpanded);
  };

  const filteredHymns = useMemo(() => {
    let hymns = [...HYMNS];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      hymns = hymns.filter(
        (hymn) =>
          hymn.title.toLowerCase().includes(query) ||
          (hymn.titleBemba && hymn.titleBemba.toLowerCase().includes(query)) ||
          hymn.number.toString().includes(query) ||
          (hymn.lyrics && hymn.lyrics.toLowerCase().includes(query)) ||
          (hymn.lyricsBemba && hymn.lyricsBemba.toLowerCase().includes(query))
      );
    }

    if (sortType === "alphabetical") {
      hymns.sort((a, b) => {
        const titleA = language === "bemba" && a.titleBemba ? a.titleBemba : a.title;
        const titleB = language === "bemba" && b.titleBemba ? b.titleBemba : b.title;
        return titleA.localeCompare(titleB);
      });
    } else {
      hymns.sort((a, b) => a.number - b.number);
    }

    return hymns;
  }, [searchQuery, sortType, language]);

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => {
    const IconComponent = item.icon;
    const hymnCount = HYMNS.filter(h => h.category === item.name).length;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => router.push(`/category/${encodeURIComponent(item.name)}` as any)}
      >
        <LinearGradient
          colors={item.colors}
          style={styles.categoryGradient}
        >
          <View style={styles.categoryIcon}>
            <IconComponent size={24} color={colors.white} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryCount}>{hymnCount} hymns</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderRecentHymnItem = ({ item }: { item: typeof HYMNS[0] }) => {
    const hasAccess = canAccessHymn(item.number);
    const displayTitle = language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

    return (
      <TouchableOpacity
        style={[styles.recentCard, isDark ? styles.recentCardDark : styles.recentCardLight]}
        onPress={() => router.push(`/hymn/${item.id}`)}
      >
        <View style={styles.recentCardContent}>
          <View style={styles.recentBadge}>
            <Text style={styles.recentBadgeText}>{item.number}</Text>
          </View>
          <Text style={[styles.recentTitle, isDark ? styles.textDark : styles.textLight]} numberOfLines={2}>
            {displayTitle}
          </Text>
          {item.category && (
            <Text style={[styles.recentCategory, isDark ? styles.subtextDark : styles.subtextLight]}>
              {item.category}
            </Text>
          )}
        </View>
        {!hasAccess && (
          <View style={styles.recentLock}>
            <Crown size={12} color={colors.mutedGray} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHymnItem = ({ item }: { item: typeof HYMNS[0] }) => {
    const hasAccess = canAccessHymn(item.number);
    const displayTitle = language === "bemba" && item.titleBemba ? item.titleBemba : item.title;

    return (
      <TouchableOpacity
        style={[styles.hymnRow, isDark ? styles.hymnRowDark : styles.hymnRowLight]}
        onPress={() => router.push(`/hymn/${item.id}`)}
      >
        <View style={styles.hymnRowContent}>
          <View style={styles.hymnNumberBadge}>
            <Text style={styles.hymnNumberBadgeText}>{item.number}</Text>
          </View>
          <View style={styles.hymnRowInfo}>
            <Text style={[styles.hymnRowTitle, isDark ? styles.textDark : styles.textLight]}>
              {displayTitle}
            </Text>
            {item.category && (
              <Text style={[styles.hymnRowCategory, isDark ? styles.subtextDark : styles.subtextLight]}>
                {item.category}
              </Text>
            )}
          </View>
          {hasAccess ? (
            <ChevronRight size={16} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          ) : (
            <Crown size={16} color={colors.mutedGray} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <View style={styles.greetingRow}>
        <View style={styles.greetingLeft}>
          <Text style={[styles.greetingText, isDark ? styles.textDark : styles.textLight]}>
            {getGreeting()}
          </Text>
          <Text style={styles.appNameText}>
            AME Church Hymns
          </Text>
        </View>
        <View style={styles.greetingRight}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleLanguage}>
            <Languages size={20} color={isDark ? colors.dark.text : colors.light.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/search" as any)}>
            <Search size={20} color={isDark ? colors.dark.text : colors.light.primary} />
          </TouchableOpacity>
          {!isPaid && (
            <TouchableOpacity style={styles.signInPill} onPress={() => Linking.openURL("https://17thdistrictrayac.org/sign-in")}>
              <LogIn size={16} color={colors.white} />
              <Text style={styles.signInPillText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Animated.View style={[styles.searchBarContainer, { height: searchHeightAnim }]}>
        <View style={[styles.searchBar, isDark ? styles.searchBarDark : styles.searchBarLight]}>
          <Search size={20} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
          <TextInput
            style={[styles.searchInput, isDark ? styles.textDark : styles.textLight]}
            placeholder="Search hymns..."
            placeholderTextColor={isDark ? colors.dark.textSecondary : colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>

      <View style={styles.heroCard}>
        <LinearGradient
          colors={isDark ? [colors.crimson, "#5E0B0B", colors.darkBackground] : [colors.crimson, "#8B1A1F", "#2A0505"]}
          style={styles.heroGradient}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Sparkles size={12} color={colors.amber} />
              <Text style={styles.heroBadgeText}>HYMN OF THE DAY</Text>
            </View>
            <Church size={24} color={colors.white} style={{ opacity: 0.5 }} />
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroNumber}>{HYMNS[0].number}</Text>
            <Text style={styles.heroTitle}>{HYMNS[0].title}</Text>
            <Text style={styles.heroCategory}>{HYMNS[0].category}</Text>
          </View>
        </LinearGradient>
      </View>

      {!isPaid && (
        <View style={styles.previewBanner}>
          <Crown size={20} color={colors.amber} />
          <Text style={[styles.previewText, isDark ? styles.textDark : styles.textLight]}>
            Preview the first 10 hymns. Sign in for full access.
          </Text>
        </View>
      )}

      <View style={styles.browseCategories}>
        <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
          Browse Categories
        </Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.name}
          numColumns={2}
          columnWrapperStyle={styles.categoryGrid}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.jumpBackIn}>
        <Text style={[styles.sectionTitle, isDark ? styles.textDark : styles.textLight]}>
          Jump Back In
        </Text>
        <FlatList
          data={HYMNS.slice(0, 5)}
          renderItem={renderRecentHymnItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentList}
        />
      </View>

      <View style={styles.allHymnsHeader}>
        <Text style={[styles.allHymnsTitle, isDark ? styles.textDark : styles.textLight]}>
          All Hymns
        </Text>
        <TouchableOpacity
          style={[styles.sortPill, isDark ? styles.sortPillDark : styles.sortPillLight]}
          onPress={() => setSortType(sortType === "numerical" ? "alphabetical" : "numerical")}
        >
          <Text style={[styles.sortPillText, isDark ? styles.sortPillTextDark : styles.sortPillTextLight]}>
            {sortType === "numerical" ? "# Number" : "A-Z"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={filteredHymns}
        renderItem={renderHymnItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: colors.light.background },
  containerDark: { backgroundColor: colors.dark.background },
  listContent: {
    paddingBottom: 40,
  },
  textLight: { color: colors.light.text },
  textDark: { color: colors.dark.text },
  subtextLight: { color: colors.light.textSecondary },
  subtextDark: { color: colors.dark.textSecondary },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greetingLeft: {},
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  appNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.crimson,
  },
  greetingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(128,128,128,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  signInPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.crimson,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  signInPillText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  searchBarContainer: {
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
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
  searchInput: { flex: 1, fontSize: 16 },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  heroGradient: {
    padding: 24,
    minHeight: 180,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.amber,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  heroBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  heroBottom: {},
  heroNumber: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    color: colors.white,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroCategory: {
    fontSize: 13,
    color: colors.white,
    opacity: 0.55,
  },
  previewBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(227,27,35,0.1)",
    borderColor: "rgba(227,27,35,0.15)",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    flex: 1,
  },
  browseCategories: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  categoryGrid: {
    gap: 12,
    marginBottom: 12,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  categoryGradient: {
    padding: 16,
    alignItems: "center",
    minHeight: 100,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryInfo: {
    alignItems: "center",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    textAlign: "center",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  jumpBackIn: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recentList: {
    paddingLeft: 0,
    paddingVertical: 8,
  },
  recentCard: {
    width: 200,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  recentCardLight: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  recentCardDark: {
    backgroundColor: colors.dark.surface,
  },
  recentCardContent: {
    flex: 1,
  },
  recentBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  recentBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recentCategory: {
    fontSize: 13,
  },
  recentLock: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  allHymnsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  allHymnsTitle: {
    fontSize: 19,
    fontWeight: "700",
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortPillLight: {
    backgroundColor: colors.linen,
  },
  sortPillDark: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  sortPillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sortPillTextLight: {
    color: colors.light.text,
  },
  sortPillTextDark: {
    color: colors.dark.text,
  },
  hymnRow: {
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  hymnRowLight: {
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  hymnRowDark: {
    backgroundColor: "transparent",
  },
  hymnRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  hymnNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  hymnNumberBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.white,
  },
  hymnRowInfo: {
    flex: 1,
  },
  hymnRowTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  hymnRowCategory: {
    fontSize: 13,
  },
});7
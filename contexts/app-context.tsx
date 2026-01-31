import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useMemo } from "react";

import { HYMNS, FREE_PREVIEW_COUNT } from "@/mocks/hymns";
import { FontSize, Hymn } from "@/types/hymn";

import { useAuth } from "./auth-context";

export const [AppContext, useApp] = createContextHook(() => {
  const { user, deviceId } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<"english" | "bemba">("english");
  const [isLoadingAppState, setIsLoadingAppState] = useState(true);

  useEffect(() => {
    loadAppState();
  }, [user]);

  const loadAppState = async () => {
    try {
      const [favoritesStr, fontSizeStr, darkModeStr, paidStr, languageStr] = await Promise.all([
        AsyncStorage.getItem("favorites"),
        AsyncStorage.getItem("fontSize"),
        AsyncStorage.getItem("isDarkMode"),
        AsyncStorage.getItem("isPaid"),
        AsyncStorage.getItem("language"),
      ]);

      if (favoritesStr) {
        setFavorites(new Set(JSON.parse(favoritesStr)));
      }
      if (fontSizeStr) {
        setFontSize(fontSizeStr as FontSize);
      }
      if (darkModeStr) {
        setIsDarkMode(darkModeStr === "true");
      }
      if (paidStr) {
        setIsPaid(paidStr === "true");
      }
      if (languageStr) {
        setLanguage(languageStr as "english" | "bemba");
      }
    } catch (error) {
      console.error("Failed to load app state:", error);
    } finally {
      setIsLoadingAppState(false);
    }
  };

  const toggleFavorite = async (hymnId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(hymnId)) {
      newFavorites.delete(hymnId);
    } else {
      newFavorites.add(hymnId);
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify([...newFavorites]));
  };

  const updateFontSize = async (size: FontSize) => {
    setFontSize(size);
    await AsyncStorage.setItem("fontSize", size);
  };

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem("isDarkMode", String(newValue));
  };

  const toggleLanguage = async () => {
    const newValue = language === "english" ? "bemba" : "english";
    setLanguage(newValue);
    await AsyncStorage.setItem("language", newValue);
  };

  const unlockApp = async () => {
    setIsPaid(true);
    await AsyncStorage.setItem("isPaid", "true");
  };

  const availableHymns = useMemo(() => {
    if (isPaid) {
      return HYMNS;
    }
    return HYMNS.slice(0, FREE_PREVIEW_COUNT);
  }, [isPaid]);

  const canAccessHymn = (hymnNumber: number) => {
    return isPaid || hymnNumber <= FREE_PREVIEW_COUNT;
  };

  const favoriteHymns = useMemo(() => {
    return HYMNS.filter((hymn) => favorites.has(hymn.id));
  }, [favorites]);

  return {
    isPaid,
    favorites,
    fontSize,
    isDarkMode,
    language,
    isLoadingAppState,
    deviceId,
    availableHymns,
    favoriteHymns,
    canAccessHymn,
    toggleFavorite,
    updateFontSize,
    toggleDarkMode,
    toggleLanguage,
    unlockApp,
  };
});

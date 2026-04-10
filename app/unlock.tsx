import { router, Stack } from "expo-router";
import { Crown, Check, ExternalLink } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/contexts/app-context";
import { usePurchases } from "@/contexts/purchases-context";

// Direct checkout URL with source=app parameter
const PAYMENT_URL = "https://17thdistrictrayac.org/checkout?product=Hymn+Book&price=50&currency=ZMW&source=app";

export default function UnlockScreen() {
  const { isDarkMode: isDark } = useApp();
  const { isPremium, isPurchasing } = usePurchases();

  const handleUnlock = async () => {
    try {
      await Linking.openURL(PAYMENT_URL);
    } catch (error) {
      Alert.alert("Error", "Could not open page. Please try again.");
    }
  };

  const features = [
    "Access all 100+ traditional hymns",
    "Offline access after download",
    "Save unlimited favorites",
    "Adjustable font sizes",
    "Dark mode support",
    "Lifetime access",
  ];

  if (isPremium) {
    return (
      <SafeAreaView
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
        edges={["top"]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.premiumContainer}>
          <Crown size={64} color="#F59E0B" />
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            You have Full Access!
          </Text>
          <Text style={[styles.subtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
            Enjoy all hymns in the collection.
          </Text>
          <TouchableOpacity style={styles.unlockButton} onPress={() => router.back()}>
            <Text style={styles.unlockButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Crown size={48} color="#F59E0B" />
          </View>
          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            Unlock Full Access
          </Text>
          <Text style={[styles.subtitle, isDark ? styles.subtextDark : styles.subtextLight]}>
            Get lifetime access to the complete hymnal collection
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, isDark ? styles.textDark : styles.textLight]}>
            What's Included
          </Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <Check size={16} color="#fff" />
              </View>
              <Text style={[styles.featureText, isDark ? styles.textDark : styles.textLight]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, isDark ? styles.infoCardDark : styles.infoCardLight]}>
          <Text style={[styles.infoText, isDark ? styles.textDark : styles.textLight]}>
            Full access is available on our website. Once activated, your app will unlock automatically.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.unlockButton, isPurchasing && styles.unlockButtonDisabled]}
          onPress={handleUnlock}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <ExternalLink size={20} color="#fff" />
              <Text style={styles.unlockButtonText}>Get Full Access</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.note, isDark ? styles.subtextDark : styles.subtextLight]}>
          You'll be taken to our website to activate full access. Return to the app once done — it will unlock automatically.
        </Text>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, isDark ? styles.subtextDark : styles.subtextLight]}>
            Maybe Later
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: "#FAFAFA" },
  containerDark: { backgroundColor: "#1a1a1a" },
  content: { padding: 24 },
  premiumContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  hero: { alignItems: "center", marginBottom: 32 },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fff3cd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: "700" as const, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center" },
  featuresContainer: { marginBottom: 24 },
  featuresTitle: { fontSize: 18, fontWeight: "600" as const, marginBottom: 16 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { fontSize: 16, flex: 1 },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoCardLight: { backgroundColor: "#EFF6FF" },
  infoCardDark: { backgroundColor: "#1e3a5f" },
  infoText: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  unlockButton: {
    flexDirection: "row",
    backgroundColor: "#F59E0B",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  unlockButtonDisabled: { opacity: 0.6 },
  unlockButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" as const },
  note: { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  cancelButton: { height: 40, alignItems: "center", justifyContent: "center" },
  cancelButtonText: { fontSize: 14 },
  textLight: { color: "#212121" },
  textDark: { color: "#fff" },
  subtextLight: { color: "#6B7280" },
  subtextDark: { color: "#aaa" },
});
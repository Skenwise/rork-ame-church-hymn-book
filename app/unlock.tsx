import { router, Stack } from "expo-router";
import { Crown, Check, ShieldAlert, RefreshCw } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/contexts/app-context";
import { usePurchases } from "@/contexts/purchases-context";

export default function UnlockScreen() {
  const { isDarkMode: isDark } = useApp();
  const {
    lifetimePackage,
    isLoadingOfferings,
    isPurchasing,
    isRestoring,
    purchaseLifetime,
    restorePurchases,
  } = usePurchases();

  const isProcessing = isPurchasing || isRestoring;

  const priceString = lifetimePackage?.product?.priceString || "$3.00";

  const handleUnlock = async () => {
    try {
      await purchaseLifetime();
      Alert.alert(
        "Success!",
        "You now have full access to all hymns.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Unlock error:", error);
      if (!error.userCancelled) {
        Alert.alert("Error", "Failed to complete purchase. Please try again.");
      }
    }
  };

  const handleRestore = async () => {
    try {
      const info = await restorePurchases();
      if (info?.entitlements.active["premium"]?.isActive) {
        Alert.alert(
          "Restored!",
          "Your purchase has been restored. You now have full access.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("No Purchase Found", "We couldn't find a previous purchase to restore.");
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    }
  };

  const features = [
    "Access all 100+ traditional hymns",
    "Offline access after download",
    "Save unlimited favorites",
    "Adjustable font sizes",
    "Dark mode support",
    "One-time purchase, lifetime access",
  ];

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

        <View style={[styles.priceCard, isDark ? styles.priceCardDark : styles.priceCardLight]}>
          {isLoadingOfferings ? (
            <ActivityIndicator size="small" color="#F59E0B" />
          ) : (
            <>
              <Text style={styles.priceAmount}>{priceString}</Text>
              <Text style={[styles.priceLabel, isDark ? styles.subtextDark : styles.subtextLight]}>
                One-time payment • Lifetime access
              </Text>
            </>
          )}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, isDark ? styles.textDark : styles.textLight]}>
            What&apos;s Included
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
          <ShieldAlert size={20} color={isDark ? "#F59E0B" : "#F59E0B"} />
          <Text style={[styles.infoText, isDark ? styles.textDark : styles.textLight]}>
            This purchase is locked to your device to prevent unauthorized sharing.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.unlockButton, isProcessing && styles.unlockButtonDisabled]}
          onPress={handleUnlock}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Crown size={20} color="#fff" />
              <Text style={styles.unlockButtonText}>Unlock Now</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isProcessing}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color={isDark ? "#aaa" : "#6B7280"} />
          ) : (
            <>
              <RefreshCw size={16} color={isDark ? "#aaa" : "#6B7280"} />
              <Text style={[styles.restoreButtonText, isDark ? styles.subtextDark : styles.subtextLight]}>
                Restore Purchase
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isProcessing}
        >
          <Text style={[styles.cancelButtonText, isDark ? styles.subtextDark : styles.subtextLight]}>
            Maybe Later
          </Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, isDark ? styles.subtextDark : styles.subtextLight]}>
          By purchasing, you agree to our Terms of Service and Privacy Policy.
          No subscriptions or recurring charges.
        </Text>
      </ScrollView>
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
  content: {
    padding: 24,
  },
  hero: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fff3cd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  priceCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
  },
  priceCardLight: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  priceCardDark: {
    backgroundColor: "#2a2a2a",
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#F59E0B",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoCardLight: {
    backgroundColor: "#fff3cd",
  },
  infoCardDark: {
    backgroundColor: "#3d3416",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  unlockButton: {
    flexDirection: "row",
    backgroundColor: "#F59E0B",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  restoreButton: {
    flexDirection: "row",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  restoreButtonText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  cancelButton: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
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

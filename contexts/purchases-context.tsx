import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback } from "react";
import { Platform } from "react-native";
import Purchases, {
  PurchasesPackage,
  LOG_LEVEL,
} from "react-native-purchases";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ENTITLEMENT_ID = "premium";

function getRCApiKey(): string {
  if (__DEV__ || Platform.OS === "web") {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "";
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  }) || "";
}

let isConfigured = false;

if (!isConfigured && getRCApiKey()) {
  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: getRCApiKey() });
    isConfigured = true;
    console.log("RevenueCat configured successfully");
  } catch (error) {
    console.error("Failed to configure RevenueCat:", error);
  }
}

export const [PurchasesContext, usePurchases] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isReady] = useState(isConfigured);

  const customerInfoQuery = useQuery({
    queryKey: ["customerInfo"],
    queryFn: async () => {
      if (!isConfigured) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        console.log("Customer info fetched:", info.entitlements.active);
        return info;
      } catch (error) {
        console.error("Failed to get customer info:", error);
        return null;
      }
    },
    enabled: isReady,
    staleTime: 1000 * 60 * 5,
  });

  const offeringsQuery = useQuery({
    queryKey: ["offerings"],
    queryFn: async () => {
      if (!isConfigured) return null;
      try {
        const offerings = await Purchases.getOfferings();
        console.log("Offerings fetched:", offerings.current?.identifier);
        return offerings;
      } catch (error) {
        console.error("Failed to get offerings:", error);
        return null;
      }
    },
    enabled: isReady,
    staleTime: 1000 * 60 * 10,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log("Purchasing package:", pkg.identifier);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      console.log("Purchase successful, updating customer info");
      queryClient.setQueryData(["customerInfo"], customerInfo);
    },
    onError: (error: any) => {
      console.error("Purchase failed:", error);
      if (error.userCancelled) {
        console.log("User cancelled the purchase");
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log("Restoring purchases...");
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      console.log("Restore successful");
      queryClient.setQueryData(["customerInfo"], customerInfo);
    },
    onError: (error) => {
      console.error("Restore failed:", error);
    },
  });

  const isPremium = customerInfoQuery.data?.entitlements.active[ENTITLEMENT_ID]?.isActive ?? false;

  const currentOffering = offeringsQuery.data?.current ?? null;

  const lifetimePackage = currentOffering?.lifetime ?? 
    currentOffering?.availablePackages?.find(p => p.identifier === "lifetime") ?? 
    currentOffering?.availablePackages?.[0] ?? null;

  const { mutateAsync: purchaseAsync } = purchaseMutation;
  const { mutateAsync: restoreAsync } = restoreMutation;

  const purchaseLifetime = useCallback(async () => {
    if (!lifetimePackage) {
      throw new Error("No lifetime package available");
    }
    return purchaseAsync(lifetimePackage);
  }, [lifetimePackage, purchaseAsync]);

  const restorePurchases = useCallback(async () => {
    return restoreAsync();
  }, [restoreAsync]);

  const refreshCustomerInfo = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
  }, [queryClient]);

  return {
    isReady,
    isPremium,
    customerInfo: customerInfoQuery.data,
    currentOffering,
    lifetimePackage,
    isLoadingOfferings: offeringsQuery.isLoading,
    isLoadingCustomerInfo: customerInfoQuery.isLoading,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchaseError: purchaseMutation.error,
    restoreError: restoreMutation.error,
    purchaseLifetime,
    restorePurchases,
    refreshCustomerInfo,
  };
});

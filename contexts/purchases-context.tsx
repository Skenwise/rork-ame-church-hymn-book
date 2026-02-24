import createContextHook from "@nkzw/create-context-hook";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export const [PurchasesContext, usePurchases] = createContextHook(() => {
  const { user } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const isPremium = user?.premiumUnlocked ?? false;

  // This will be called after GeePay payment succeeds
  // For now it's a placeholder — real unlock happens via Firebase Function webhook
  const purchaseLifetime = async () => {
    setIsPurchasing(true);
    try {
      // GeePay payment will be initiated here
      // The actual unlock happens server-side via webhook → Firestore update
      // The app reacts automatically via the onSnapshot listener in auth-context
      throw new Error("Payment via website — redirect user to payment page");
    } finally {
      setIsPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    // With Firebase, premium status is always synced from Firestore
    // No restore needed — just check current user's premiumUnlocked status
    return null;
  };

  return {
    isPremium,
    isPurchasing,
    isRestoring: false,
    isLoadingOfferings: false,
    lifetimePackage: { product: { priceString: "K50.00" } },
    purchaseLifetime,
    restorePurchases,
  };
});
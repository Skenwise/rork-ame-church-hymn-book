import AsyncStorage from "@react-native-async-storage/async-storage";

export type CachedDeviceStatus = "ok" | "limit" | null;

export interface CachedEntitlement {
  uid: string;
  email: string;
  displayName: string;
  premiumUnlocked: boolean;
  vip: boolean;
  deviceStatus: CachedDeviceStatus;
  verifiedAt: number; // epoch ms of the last successful server sync
}

const keyFor = (uid: string) => `entitlement.v1.${uid}`;

export async function loadEntitlement(uid: string): Promise<CachedEntitlement | null> {
  if (!uid) return null;
  try {
    const raw = await AsyncStorage.getItem(keyFor(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.uid === "string" &&
      parsed.uid === uid &&
      typeof parsed.premiumUnlocked === "boolean"
    ) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn("[entitlement] cache read failed:", error);
    return null;
  }
}

export async function saveEntitlement(entitlement: CachedEntitlement): Promise<void> {
  if (!entitlement.uid) return;
  try {
    await AsyncStorage.setItem(keyFor(entitlement.uid), JSON.stringify(entitlement));
  } catch (error) {
    console.warn("[entitlement] cache write failed:", error);
  }
}

export async function clearEntitlement(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await AsyncStorage.removeItem(keyFor(uid));
  } catch (error) {
    // swallow errors
  }
}

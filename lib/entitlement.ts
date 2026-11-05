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
const LAST_UID_KEY = "entitlement.v1.lastUid";

export async function getLastUid(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_UID_KEY);
  } catch (error) {
    console.warn("[entitlement] last-account read failed:", error);
    return null;
  }
}

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
    await AsyncStorage.multiSet([
      [keyFor(entitlement.uid), JSON.stringify(entitlement)],
      [LAST_UID_KEY, entitlement.uid],
    ]);
  } catch (error) {
    console.warn("[entitlement] cache write failed:", error);
  }
}

export async function clearEntitlement(uid: string): Promise<void> {
  if (!uid) return;
  try {
    const last = await AsyncStorage.getItem(LAST_UID_KEY);
    const keys = [keyFor(uid)];
    if (last === uid) keys.push(LAST_UID_KEY);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    // swallow errors
  }
}

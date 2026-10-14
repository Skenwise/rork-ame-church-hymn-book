import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { Platform } from "react-native";

export const MAX_DEVICES = 2;
export const STALE_DEVICE_DAYS = 30;

let cachedId: string | null = null;

// Stable identifier for this phone, persisted across restarts.
// A reinstall generates a new id; the 30-day stale rule frees the old
// slot automatically.
export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;

  const stored = await AsyncStorage.getItem("deviceId");
  if (stored) {
    cachedId = stored;
    return stored;
  }

  const id = Crypto.randomUUID();
  await AsyncStorage.setItem("deviceId", id);
  cachedId = id;
  return id;
}

// Human-readable name shown on the device management screens.
export function getDeviceName(): string {
  const parts = [Device.brand, Device.modelName].filter(Boolean);
  let base = parts.length > 0 ? parts.join(" ") : "Unknown device";
  base = base.charAt(0).toUpperCase() + base.slice(1);
  const os = Platform.OS === "ios" ? "iPhone" : Platform.OS === "android" ? "Android" : "Web";
  return `${base} (${os})`;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { Platform } from "react-native";

export const MAX_DEVICES = 2;
export const STALE_DEVICE_DAYS = 30;

const DEVICE_ID_KEY = "deviceId.v2";
const LEGACY_DEVICE_ID_KEY = "deviceId";

let cachedId: string | null = null;
let pendingId: Promise<string> | null = null;

// Stable identifier for this phone.
// A stable hardware id (Android ANDROID_ID / iOS IDFV) is hashed so the raw
// value is never stored. Reinstalling or clearing app data keeps the same id,
// so the phone reuses its existing device slot instead of creating a new one.
async function platformHardwareId(): Promise<string | null> {
  try {
    if (Platform.OS === "android") {
      const id = Application.getAndroidId();
      return id || null;
    }
    if (Platform.OS === "ios") {
      return await Application.getIosIdForVendorAsync();
    }
  } catch (error) {
    console.warn("[device] platform id unavailable:", error);
  }
  return null;
}

async function createDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;

  const hardwareId = await platformHardwareId();
  let id: string;

  if (hardwareId) {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Platform.OS}:${hardwareId}`
    );
    id = `${Platform.OS}_${digest.slice(0, 32)}`;
  } else {
    // Last resort: previously stored installation id, or a fresh random one.
    const legacy = await AsyncStorage.getItem(LEGACY_DEVICE_ID_KEY);
    id = legacy || Crypto.randomUUID();
  }

  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

// Returns the stable id. Concurrent callers share one in-flight computation so
// a fresh install can never generate two different ids at the same time.
export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;

  if (!pendingId) {
    pendingId = createDeviceId()
      .then((id) => {
        cachedId = id;
        return id;
      })
      .finally(() => {
        pendingId = null;
      });
  }

  return pendingId;
}

// The old installation-scoped id, kept so the previous Firestore device entry
// can be migrated to the stable id instead of consuming a second slot.
export async function getLegacyDeviceId(): Promise<string | null> {
  return AsyncStorage.getItem(LEGACY_DEVICE_ID_KEY);
}

// Time this app was installed on the device (not counting updates). Used to
// recognise device entries left behind by a previous install.
export async function getInstallTime(): Promise<number | null> {
  try {
    const installedAt = await Application.getInstallationTimeAsync();
    return installedAt ? installedAt.getTime() : null;
  } catch {
    return null;
  }
}

// Human-readable name shown on the device management screens.
export function getDeviceName(): string {
  const parts = [Device.brand, Device.modelName].filter(Boolean);
  let base = parts.length > 0 ? parts.join(" ") : "Unknown device";
  base = base.charAt(0).toUpperCase() + base.slice(1);
  const os = Platform.OS === "ios" ? "iPhone" : Platform.OS === "android" ? "Android" : "Web";
  return `${base} (${os})`;
}

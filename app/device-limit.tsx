import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDeviceId } from "@/lib/device";
import { useAuth } from "@/contexts/auth-context";

interface RegisteredDevice {
  id: string;
  name: string;
  registeredAt?: number;
  lastSeen?: number;
}

function formatLastSeen(ms?: number): string {
  if (!ms) return "unknown";
  const diff = Date.now() - ms;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (diff < 60 * 60 * 1000) return "just now";
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(ms).toLocaleDateString();
}

export default function DeviceLimit() {
  const router = useRouter();
  const { user, removeDevice } = useAuth();
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    if (!user) return;
    try {
      const [snap, myId] = await Promise.all([
        getDoc(doc(db, "users", user.userId)),
        getDeviceId(),
      ]);
      setCurrentDeviceId(myId);
      const raw: Record<string, { name?: string; registeredAt?: number; lastSeen?: number }> =
        snap.data()?.devices ?? {};
      const list = Object.entries(raw).map(([id, d]) => ({
        id,
        name: d?.name || "Unknown device",
        registeredAt: d?.registeredAt,
        lastSeen: d?.lastSeen,
      }));
      list.sort((a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0));
      setDevices(list);
      setError(null);
    } catch (e) {
      console.error("[DeviceLimit] Load failed:", e);
      setError("Could not load your devices. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleRemove = async (deviceId: string) => {
    setRemovingId(deviceId);
    setError(null);
    try {
      // removeDevice re-attempts registration for this phone; if a slot
      // opened, premium is active again and we can leave this screen.
      await removeDevice(deviceId);
      await loadDevices();
      router.replace("/(tabs)/(home)");
    } catch (e) {
      console.error("[DeviceLimit] Remove failed:", e);
      setError("Could not remove that device. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Device Limit Reached</Text>
      <Text style={styles.subtitle}>
        {user?.premiumUnlocked
          ? "Your account includes the hymn book on up to 2 phones. Remove a phone below to use it here, or keep using the free hymns."
          : "You can use the hymn book on up to 2 phones. Remove a phone below to use it here."}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#E31B23" style={{ marginTop: 32 }} />
      ) : (
        <View style={styles.deviceList}>
          {devices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceMeta}>Last used {formatLastSeen(device.lastSeen)}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && styles.removeButtonPressed,
                  removingId === device.id && styles.removeButtonDisabled,
                ]}
                onPress={() => handleRemove(device.id)}
                disabled={removingId !== null}
              >
                <Text style={styles.removeButtonText}>
                  {removingId === device.id ? "Removing…" : "Remove"}
                </Text>
              </Pressable>
            </View>
          ))}
          {devices.length === 0 && (
            <Text style={styles.emptyText}>No phones registered to this account.</Text>
          )}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={({ pressed }) => [styles.freeButton, pressed && styles.freeButtonPressed]}
        onPress={() => router.replace("/(tabs)/(home)")}
      >
        <Text style={styles.freeButtonText}>Continue with free hymns</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9F7F0",
  },
  content: {
    padding: 24,
    paddingTop: 72,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#315482",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#5A7BA0",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  deviceList: {
    gap: 12,
  },
  deviceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(49, 84, 130, 0.12)",
  },
  deviceInfo: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  deviceMeta: {
    fontSize: 13,
    color: "#6B7280",
  },
  removeButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  removeButtonPressed: {
    opacity: 0.7,
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
  removeButtonText: {
    color: "#B91C1C",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },
  freeButton: {
    marginTop: 16,
    backgroundColor: "#315482",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  freeButtonPressed: {
    opacity: 0.85,
  },
  freeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

import { Tabs } from "expo-router";
import { BookOpen, Church, ScrollText } from "lucide-react-native";
import React from "react";

import { useApp } from "@/contexts/app-context";

export default function TabLayout() {
  const { isDarkMode: isDark } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#4A90E2" : "#1A237E",
        tabBarInactiveTintColor: isDark ? "#888" : "#9CA3AF",
        tabBarStyle: {
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          borderTopColor: isDark ? "#333" : "#E5E7EB",
          borderTopWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 3,
          elevation: isDark ? 0 : 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Hymns",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="call-to-worship"
        options={{
          title: "Call to Worship",
          tabBarIcon: ({ color }) => <Church size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="apostles-creed"
        options={{
          title: "Apostles' Creed",
          tabBarIcon: ({ color }) => <ScrollText size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

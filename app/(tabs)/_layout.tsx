import { Tabs } from "expo-router";
import { BookOpen, Church, ScrollText } from "lucide-react-native";
import React from "react";

import { useApp } from "@/contexts/app-context";

export default function TabLayout() {
  const { isDarkMode: isDark } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#4A90E2" : "#5281BD",
        tabBarInactiveTintColor: isDark ? "#888" : "#999",
        tabBarStyle: {
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          borderTopColor: isDark ? "#333" : "#e0e0e0",
          borderTopWidth: 1,
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

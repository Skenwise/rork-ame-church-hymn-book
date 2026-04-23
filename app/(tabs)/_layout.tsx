import { Tabs } from "expo-router";
import { BookOpen, Church, ScrollText, Home, Settings } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";

import { useApp } from "@/contexts/app-context";

export default function TabLayout() {
  const { isDarkMode: isDark } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E31B23",
        tabBarInactiveTintColor: isDark ? "#555" : "#A1A1AA",
        tabBarStyle: {
          backgroundColor: "transparent",
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="call-to-worship"
        options={{
          title: "Call to Worship",
          tabBarIcon: ({ color, size }) => <Church size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="decalogue"
        options={{
          title: "Decalogue",
          tabBarIcon: ({ color, size }) => <BookOpen size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="apostles-creed"
        options={{
          title: "Apostles' Creed",
          tabBarIcon: ({ color, size }) => <ScrollText size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size - 2} color={color} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
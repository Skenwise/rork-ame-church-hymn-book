import { Tabs } from "expo-router";
import { BookOpen, Church, ScrollText, Home, Settings } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

import { useApp } from "@/contexts/app-context";

export default function TabLayout() {
  const { isDarkMode: isDark } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E31B23",
        tabBarInactiveTintColor: isDark ? "#555" : "#A1A1AA",

        tabBarStyle:
          Platform.OS === "web"
            ? {
                backgroundColor: isDark
                  ? "rgba(10, 10, 11, 0.92)"
                  : "rgba(237, 233, 225, 0.85)",
                borderTopColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.04)",
                borderTopWidth: StyleSheet.hairlineWidth,
              }
            : {
                position: "absolute",
                backgroundColor: "transparent",
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
              },

        tabBarBackground: () =>
          Platform.OS !== "web" ? (
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={isDark ? 90 : 80}
              style={[
                StyleSheet.absoluteFill,
                !isDark && {
                  backgroundColor: "rgba(237, 233, 225, 0.6)",
                },
              ]}
            />
          ) : null,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.2,
        },

        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home size={size - 2} color={color} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="call-to-worship"
        options={{
          title: "Call to Worship",
          tabBarIcon: ({ color, size }) => (
            <Church size={size - 2} color={color} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="decalogue"
        options={{
          title: "Decalogue",
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size - 2} color={color} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="apostles-creed"
        options={{
          title: "Apostles' Creed",
          tabBarIcon: ({ color, size }) => (
            <ScrollText size={size - 2} color={color} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size - 2} color={color} strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#0A0823'
          },
          default: {
            backgroundColor: '#0A0823'
          }
        })
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Theory",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Exercise",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="doc.text.fill" color={color} />
          )
        }}
      />
    </Tabs>
  );
}
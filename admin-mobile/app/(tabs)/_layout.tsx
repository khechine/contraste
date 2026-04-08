import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { IconButton } from 'react-native-paper';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { logout } = useAuth();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerRight: () => (
          <IconButton
            icon="logout"
            onPress={logout}
            iconColor={colors.icon}
            size={22}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Livres',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
          headerTitle: 'Mes Livres',
        }}
      />
      <Tabs.Screen
        name="authors"
        options={{
          title: 'Auteurs',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
          headerTitle: 'Auteurs',
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'Actualités',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="newspaper.fill" color={color} />,
          headerTitle: 'Actualités',
        }}
      />
    </Tabs>
  );
}

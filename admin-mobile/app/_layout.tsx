import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { Colors } from '@/constants/theme';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(tabs)' || segments[0]?.startsWith('edit-');
    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const customLightTheme = {
    ...NavDefaultTheme,
    colors: {
      ...NavDefaultTheme.colors,
      background: Colors.light.background,
      card: Colors.light.surface,
      text: Colors.light.text,
      border: Colors.light.border,
      primary: Colors.light.tint,
    },
  };

  const customDarkTheme = {
    ...NavDarkTheme,
    colors: {
      ...NavDarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.surface,
      text: Colors.dark.text,
      border: Colors.dark.border,
      primary: Colors.dark.tint,
    },
  };

  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={isDark ? customDarkTheme : customLightTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false, title: 'Connexion' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="edit-book" options={{ 
            presentation: 'modal', 
            title: 'Modifier le livre', 
            headerStyle: { backgroundColor: colors.surface }, 
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700', fontSize: 18, color: colors.text } 
          }} />
          <Stack.Screen name="edit-author" options={{ 
            presentation: 'modal', 
            title: 'Modifier l’auteur', 
            headerStyle: { backgroundColor: colors.surface }, 
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700', fontSize: 18, color: colors.text } 
          }} />
          <Stack.Screen name="edit-news" options={{ 
            presentation: 'modal', 
            title: 'Modifier l’actualité', 
            headerStyle: { backgroundColor: colors.surface }, 
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700', fontSize: 18, color: colors.text } 
          }} />
          <Stack.Screen name="edit-press" options={{ 
            presentation: 'modal', 
            title: 'Modifier l’article de presse', 
            headerStyle: { backgroundColor: colors.surface }, 
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700', fontSize: 18, color: colors.text } 
          }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Détails' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

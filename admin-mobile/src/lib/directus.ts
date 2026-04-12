import { createDirectus, rest, authentication } from '@directus/sdk';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Use local fallback if env not found
const BASE_URL = process.env.EXPO_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export const DIRECTUS_URL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

// Adaptateur de stockage compatible Web et Mobile
const storageAdapter = {
  get: (key: string) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  set: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  delete: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Création du client avec persistance
// On utilise l'adaptateur pour toutes les plateformes (LocalStorage sur Web, SecureStore sur Mobile)
const authConfig = authentication('json', { storage: storageAdapter as any });

export const directus = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authConfig);

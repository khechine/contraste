import { createDirectus, rest, authentication } from '@directus/sdk';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Use localhost:8055 for web, fallback for mobile
const BASE_URL = 'http://localhost:8055';

export const DIRECTUS_URL = BASE_URL;

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
// On utilise l'adaptateur seulement pour le mobile (SecureStore)
// Sur Web, on laisse le SDK utiliser son implémentation par défaut (localStorage)
const authConfig = Platform.OS === 'web' 
  ? authentication('json') 
  : authentication('json', { storage: storageAdapter as any });

export const directus = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authConfig);

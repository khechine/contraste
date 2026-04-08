import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { directus } from '../lib/directus';
import { readMe } from '@directus/sdk';

interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Le SDK gère la récupération du jeton via l'adaptateur de stockage
        // On vérifie simplement si on peut récupérer le profil 'me'
        const me = await directus.request(readMe());
        setUser(me);
      } catch (error) {
        console.log('No valid session found or session expired');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      
      console.log('Logging in with SDK for:', cleanEmail);
      
      // On s'assure que le client est propre
      await directus.logout().catch(() => {});
      
      // Connexion via le SDK (maintenant que storageAdapter est fixé pour le Web)
      await directus.login({ email: cleanEmail, password: cleanPassword });
      
      console.log('SDK login successful. Fetching profile...');

      // On attend un peu pour la persistance interne (nécessaire sur certains environnements)
      await new Promise(resolve => setTimeout(resolve, 500));

      const me = await directus.request(readMe());
      setUser(me);
      console.log('Login and profile fetch successful.');
      
    } catch (e: any) {
      console.error('Login error detail:', e);
      let errorMessage = 'Identifiants invalides';
      if (e.errors?.[0]?.message) {
        errorMessage = e.errors[0].message;
      } else if (e.message) {
        errorMessage = e.message;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await directus.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

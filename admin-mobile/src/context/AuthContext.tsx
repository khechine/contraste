import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { directus } from '../lib/directus';
import { readMe } from '@directus/sdk';

interface AssetOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  quality?: number;
}

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  getAssetUrl: (id: string | null, options?: AssetOptions) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchToken = async () => {
    try {
      const currentToken = await (directus as any).getToken();
      setToken(currentToken);
      return currentToken;
    } catch (e) {
      setToken(null);
      return null;
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const me = await directus.request(readMe());
        setUser(me);
        await fetchToken();
      } catch (error) {
        console.log('No valid session found or session expired');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password; // Ne pas trimmer le mot de passe
      
      await directus.logout().catch(() => {});
      await directus.login({ email: cleanEmail, password: cleanPassword });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const me = await directus.request(readMe());
      setUser(me);
      await fetchToken();
    } catch (e: any) {
      console.error('Login error detail:', JSON.stringify(e, null, 2));
      let errorMessage = 'Erreur de connexion';
      
      if (e.errors?.[0]?.message) {
        errorMessage = e.errors[0].message;
      } else if (e.message) {
        errorMessage = e.message;
      }

      if (errorMessage === 'Invalid user credentials') {
        errorMessage = 'Identifiants invalides';
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
      setToken(null);
    }
  };

  const getAssetUrl = (id: string | null, options?: AssetOptions) => {
    if (!id) return null;
    let url = `${directus.url}/assets/${id}`;
    const params = new URLSearchParams();

    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.fit) params.append('fit', options.fit);
    if (options?.quality) params.append('quality', options.quality.toString());
    if (token) params.append('access_token', token);

    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, getAssetUrl }}>
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

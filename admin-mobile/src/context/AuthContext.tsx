import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, logoutApi, getCurrentUser, clearTokens, getAccessToken, API_URL } from '../lib/api';

interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  getImageUrl: (url: string | null) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await getCurrentUser();
          setUser(me);
        }
      } catch (error) {
        console.log('No valid session found or session expired');
        await clearTokens();
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
      const userData = await loginApi(cleanEmail, password);
      setUser(userData);
    } catch (e: any) {
      let errorMessage = 'Erreur de connexion';
      try {
        const parsed = JSON.parse(e.message);
        errorMessage = parsed.detail || parsed.non_field_errors?.[0] || e.message;
      } catch {
        errorMessage = e.message || errorMessage;
      }

      if (errorMessage.includes('No active account') || errorMessage.includes('credentials')) {
        errorMessage = 'Identifiants invalides';
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
    }
  };

  /**
   * Returns a usable image URL from a Django API response.
   * Django serializers return absolute URLs (cover_url, photo_url, image_url),
   * so usually the URL is already correct.
   */
  const getImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    // Already absolute
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Relative path - prefix with API_URL
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, getImageUrl }}>
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

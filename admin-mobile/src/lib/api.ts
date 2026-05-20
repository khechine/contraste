/**
 * Django REST API client for Contraste Éditions mobile admin.
 * Replaces Directus SDK with JWT-based authentication against the Django backend.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ─── Base URL ────────────────────────────────────────────────────
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://directus.contraste.tn';
export const API_URL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

// ─── Token Storage ───────────────────────────────────────────────
const TOKEN_KEYS = {
  access: 'contraste_access_token',
  refresh: 'contraste_refresh_token',
};

async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

async function deleteStoredValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

// ─── Token Management ────────────────────────────────────────────
export async function getAccessToken(): Promise<string | null> {
  return getStoredValue(TOKEN_KEYS.access);
}

export async function getRefreshToken(): Promise<string | null> {
  return getStoredValue(TOKEN_KEYS.refresh);
}

export async function storeTokens(access: string, refresh: string): Promise<void> {
  await setStoredValue(TOKEN_KEYS.access, access);
  await setStoredValue(TOKEN_KEYS.refresh, refresh);
}

export async function clearTokens(): Promise<void> {
  await deleteStoredValue(TOKEN_KEYS.access);
  await deleteStoredValue(TOKEN_KEYS.refresh);
}

// ─── Token Refresh ───────────────────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refresh = await getRefreshToken();
      if (!refresh) return null;

      const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) {
        await clearTokens();
        return null;
      }

      const data = await res.json();
      await setStoredValue(TOKEN_KEYS.access, data.access);
      return data.access as string;
    } catch {
      await clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Authenticated Fetch ─────────────────────────────────────────
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let token = await getAccessToken();

  const doFetch = async (accessToken: string | null) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Don't set Content-Type for FormData (let the browser set the boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const url = path.startsWith('http') ? path : `${API_URL}${path}`;
    return fetch(url, { ...options, headers });
  };

  let res = await doFetch(token);

  // If 401, try refreshing the token once
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(errorBody || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text() as any;
}

// ─── Auth API ────────────────────────────────────────────────────
export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Identifiants invalides');
  }

  const data = await res.json();
  await storeTokens(data.access, data.refresh);
  return data.user;
}

export async function logoutApi() {
  try {
    const refresh = await getRefreshToken();
    if (refresh) {
      await apiFetch('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });
    }
  } catch {
    // Ignore logout errors
  } finally {
    await clearTokens();
  }
}

export async function getCurrentUser() {
  return apiFetch('/api/auth/me/');
}

// ─── CRUD Helpers ────────────────────────────────────────────────
export async function fetchList<T = any>(
  resource: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  const url = `/api/v1/${resource}/${qs ? `?${qs}` : ''}`;
  const data = await apiFetch<any>(url);

  // DRF can return paginated or raw array
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
}

export async function fetchDetail<T = any>(resource: string, id: string | number): Promise<T> {
  return apiFetch<T>(`/api/v1/${resource}/${id}/`);
}

export async function createResource<T = any>(resource: string, data: any): Promise<T> {
  // If data is FormData, send as multipart
  if (data instanceof FormData) {
    return apiFetch<T>(`/api/v1/${resource}/`, {
      method: 'POST',
      body: data,
    });
  }
  return apiFetch<T>(`/api/v1/${resource}/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateResource<T = any>(
  resource: string,
  id: string | number,
  data: any,
): Promise<T> {
  if (data instanceof FormData) {
    return apiFetch<T>(`/api/v1/${resource}/${id}/`, {
      method: 'PATCH',
      body: data,
    });
  }
  return apiFetch<T>(`/api/v1/${resource}/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteResource(resource: string, id: string | number): Promise<void> {
  await apiFetch(`/api/v1/${resource}/${id}/`, { method: 'DELETE' });
}

// ─── Media Upload ────────────────────────────────────────────────
export async function uploadMedia(
  uri: string,
  folder: string = 'uploads',
): Promise<{ url: string; path: string; name: string }> {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('file', blob, filename);
  } else {
    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);
  }
  formData.append('folder', folder);

  return apiFetch('/api/v1/media/', {
    method: 'POST',
    body: formData,
  });
}

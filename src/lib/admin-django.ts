/**
 * admin-django.ts — Client admin pour le backend Django (JWT).
 * Remplace admin-directus.ts.
 */

const DJANGO_URL = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';

const TOKEN_KEY = 'contraste_admin_token';
const REFRESH_KEY = 'contraste_admin_refresh';

// ─── Token management ──────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── Auth headers ──────────────────────────────────────────────────────────────
function authHeaders(extra?: Record<string, string>): HeadersInit {
  const token = getAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// ─── Login ─────────────────────────────────────────────────────────────────────
export async function adminLogin(usernameOrEmail: string, password: string): Promise<{
  user: Record<string, any>;
  access: string;
  refresh: string;
}> {
  const res = await fetch(`${DJANGO_URL}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usernameOrEmail, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || `Login failed: ${res.status}`);
  }

  const data = await res.json();
  setTokens(data.access, data.refresh);
  return data;
}

// ─── Logout ────────────────────────────────────────────────────────────────────
export async function adminLogout() {
  const refresh = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
  try {
    await fetch(`${DJANGO_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
  } catch { /* ignore */ }
  clearTokens();
}

// ─── Current user ──────────────────────────────────────────────────────────────
export async function getMe(): Promise<Record<string, any> | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${DJANGO_URL}/api/auth/me/`, {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getMe();
  return !!user;
}

// ─── Generic CRUD ──────────────────────────────────────────────────────────────
/** GET list from /api/v1/{resource}/ */
export async function adminList(resource: string, params?: Record<string, string>) {
  const url = new URL(`${DJANGO_URL}/api/v1/${resource}/`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${resource} failed: ${res.status}`);
  const data = await res.json();
  return data.results ?? data;
}

/** GET single from /api/v1/{resource}/{id}/ */
export async function adminGet(resource: string, id: number | string) {
  const res = await fetch(`${DJANGO_URL}/api/v1/${resource}/${id}/`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`GET ${resource}/${id} failed: ${res.status}`);
  return res.json();
}

/** POST to /api/v1/{resource}/ — supports FormData for file upload */
export async function adminCreate(resource: string, data: Record<string, any> | FormData) {
  const isFormData = data instanceof FormData;
  const res = await fetch(`${DJANGO_URL}/api/v1/${resource}/`, {
    method: 'POST',
    headers: authHeaders(isFormData ? {} : { 'Content-Type': 'application/json' }),
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

/** PATCH /api/v1/{resource}/{id}/ — supports FormData for file upload */
export async function adminUpdate(resource: string, id: number | string, data: Record<string, any> | FormData) {
  const isFormData = data instanceof FormData;
  const res = await fetch(`${DJANGO_URL}/api/v1/${resource}/${id}/`, {
    method: 'PATCH',
    headers: authHeaders(isFormData ? {} : { 'Content-Type': 'application/json' }),
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

/** DELETE /api/v1/{resource}/{id}/ */
export async function adminDelete(resource: string, id: number | string) {
  const res = await fetch(`${DJANGO_URL}/api/v1/${resource}/${id}/`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`DELETE ${resource}/${id} failed: ${res.status}`);
  return true;
}

/** Upload a file to /api/v1/media/ */
export async function adminUploadMedia(file: File, folder = 'uploads'): Promise<{ url: string; path: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const res = await fetch(`${DJANGO_URL}/api/v1/media/`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

/** GET stats from /api/v1/stats/ */
export async function adminGetStats() {
  const res = await fetch(`${DJANGO_URL}/api/v1/stats/`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Stats failed: ${res.status}`);
  return res.json();
}

export const DJANGO_URL_EXPORT = DJANGO_URL;

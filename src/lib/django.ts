/**
 * django.ts — Couche d'accès aux données via le backend Django REST API.
 * Remplace directus.ts — les mêmes fonctions sont exportées.
 */
import { Book, Author, HeroSection, News, Press } from './types';

const DJANGO_URL =
  typeof window === 'undefined'
    ? process.env.DJANGO_INTERNAL_URL || process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000'
    : process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function djangoFetch<T>(
  path: string,
  params?: Record<string, string>,
  options?: RequestInit
): Promise<T> {
  const url = new URL(`${DJANGO_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    });
  }

  try {
    const res = await fetch(url.toString(), {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`Django API ${res.status} for ${path}`);
      return [] as unknown as T;
    }

    const json = await res.json();
    // DRF paginated response: { count, results } or plain array
    return (json.results ?? json) as T;
  } catch (err) {
    console.error(`Django fetch error for ${path}:`, err);
    return [] as unknown as T;
  }
}

// ─── Image URL ────────────────────────────────────────────────────────────────
export function getImageUrl(
  filename: string | null | undefined | { id: string; filename_disk: string } | { url: string }
): string | null {
  if (!filename) return null;

  const publicUrl = process.env.NEXT_PUBLIC_DJANGO_URL || 'https://directus.contraste.tn';
  const cleanUrl = (url: string): string => {
    return url.replace(/^https?:\/\/(backend|localhost|127\.0\.0\.1):8000/, publicUrl);
  };

  // Object with url directly (from serializer)
  if (typeof filename === 'object' && 'url' in filename) {
    const rawUrl = (filename as any).url;
    return rawUrl ? cleanUrl(rawUrl) : null;
  }

  const fn = String(filename);
  if (fn.startsWith('http://') || fn.startsWith('https://')) {
    return cleanUrl(fn);
  }
  
  if (fn.startsWith('/')) {
    const isClient = typeof window !== 'undefined';
    const base = isClient ? publicUrl : DJANGO_URL;
    return `${base}${fn}`;
  }

  const isClient = typeof window !== 'undefined';
  const base = isClient ? publicUrl : DJANGO_URL;
  return `${base}/media/${fn}`;
}

// ─── Map raw API book to Book type ───────────────────────────────────────────
function mapBook(raw: any): Book {
  return {
    id: raw.id,
    title: raw.title || '',
    title_en: raw.title_en || raw.title || '',
    title_ar: raw.title_ar || raw.title || '',
    slug: raw.slug || '',
    author_id: raw.author || null,
    author_name: raw.author_name_display || raw.author_name || '',
    author: raw.author_detail || null,
    description: raw.description || '',
    description_en: raw.description_en || raw.description || '',
    description_ar: raw.description_ar || raw.description || '',
    cover: raw.cover_url || raw.cover || null,
    cover_image: raw.cover_url || raw.cover || null,
    price_dt: Number(raw.price_dt || 0),
    price_eur: Number(raw.price_eur || 0),
    year: raw.year,
    pages: raw.pages,
    isbn: raw.isbn,
    language: raw.language,
    category: raw.category,
    is_featured: raw.is_featured || false,
  };
}

// ─── Map raw API author to Author type ───────────────────────────────────────
function mapAuthor(raw: any): Author {
  return {
    id: raw.id,
    name: raw.name || '',
    name_en: raw.name_en,
    slug: raw.slug || '',
    bio: raw.bio_fr || '',
    bio_fr: raw.bio_fr,
    bio_en: raw.bio_en || '',
    bio_ar: raw.bio_ar || '',
    image: raw.photo_url || raw.photo || null,
    photo: raw.photo_url || raw.photo || null,
    country: raw.country,
    is_author_of_month: raw.is_author_of_month || false,
  };
}

// ─── Map raw API news to News type ───────────────────────────────────────────
function mapNews(raw: any): News {
  return {
    id: raw.id,
    title: raw.title || '',
    title_en: raw.title_en || raw.title || '',
    title_ar: raw.title_ar || raw.title || '',
    slug: raw.slug || '',
    content: raw.content_fr || '',
    content_fr: raw.content_fr,
    content_en: raw.content_en || '',
    content_ar: raw.content_ar || '',
    excerpt: (raw.excerpt || raw.content_fr || '').substring(0, 150),
    excerpt_en: (raw.content_en || '').substring(0, 150),
    excerpt_ar: (raw.content_ar || '').substring(0, 150),
    image: raw.image_url || raw.image || null,
    date: raw.date || null,
    author: raw.author,
  };
}

// ─── Books API ────────────────────────────────────────────────────────────────
export async function getBooks(limit = 500): Promise<Book[]> {
  const data = await djangoFetch<any[]>('/api/v1/books/', {
    limit: String(limit),
    ordering: '-id',
  });
  return (Array.isArray(data) ? data : []).map(mapBook);
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const data = await djangoFetch<any[]>('/api/v1/books/featured/');
  if (Array.isArray(data) && data.length > 0) return data.map(mapBook);
  return getBooks(6);
}

export async function getLatestBook(): Promise<Book | null> {
  const data = await djangoFetch<any[]>('/api/v1/books/latest/', { limit: '1' });
  const books = (Array.isArray(data) ? data : []).map(mapBook);
  return books[0] || null;
}

export async function getBook(id: number): Promise<Book | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/books/${id}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return mapBook(await res.json());
  } catch { return null; }
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/books/by-slug/${slug}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return mapBook(await res.json());
  } catch { return null; }
}

// ─── Authors API ──────────────────────────────────────────────────────────────
export async function getAuthors(limit = 500): Promise<Author[]> {
  const data = await djangoFetch<any[]>('/api/v1/authors/', {
    limit: String(limit),
    ordering: 'name',
  });
  return (Array.isArray(data) ? data : []).map(mapAuthor);
}

export async function getAuthor(id: number): Promise<Author | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/authors/${id}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return mapAuthor(await res.json());
  } catch { return null; }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/authors/by-slug/${slug}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return mapAuthor(await res.json());
  } catch { return null; }
}

export async function getAuthorOfTheMonth(): Promise<Author | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/authors/author-of-month/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.id) return null;
    return mapAuthor(data);
  } catch { return null; }
}

// ─── News API ─────────────────────────────────────────────────────────────────
export async function getNews(): Promise<News[]> {
  const data = await djangoFetch<any[]>('/api/v1/news/', {
    limit: '50',
    ordering: '-date',
  });
  return (Array.isArray(data) ? data : []).map(mapNews);
}

export async function getLatestNews(limit = 3): Promise<News[]> {
  const data = await djangoFetch<any[]>('/api/v1/news/', {
    limit: String(limit),
    ordering: '-date',
  });
  return (Array.isArray(data) ? data : []).map(mapNews);
}

export async function getFeaturedNews(limit = 3): Promise<News[]> {
  return getLatestNews(limit);
}

export async function getNewsItemBySlug(slug: string): Promise<News | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/news/by-slug/${slug}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return mapNews(await res.json());
  } catch { return null; }
}

export async function getNewsItem(id: number): Promise<News | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/news/${id}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return mapNews(await res.json());
  } catch { return null; }
}

// ─── Hero Sections API ────────────────────────────────────────────────────────
export async function getHeroSections(): Promise<HeroSection[]> {
  const data = await djangoFetch<any[]>('/api/v1/hero-sections/', {
    ordering: 'order',
  });
  return (Array.isArray(data) ? data : []).map((raw: any): HeroSection => ({
    id: raw.id,
    title: raw.title || '',
    title_en: raw.title_en || '',
    title_ar: raw.title_ar || '',
    subtitle: raw.subtitle || '',
    subtitle_en: raw.subtitle_en || '',
    subtitle_ar: raw.subtitle_ar || '',
    description: raw.description || '',
    description_en: raw.description_en || '',
    description_ar: raw.description_ar || '',
    cta_label: raw.cta_label || '',
    cta_label_en: raw.cta_label_en || '',
    cta_label_ar: raw.cta_label_ar || '',
    cta_url: raw.cta_url || '',
    image: raw.image_url || raw.image || null,
    type: raw.type || 'main',
    order: raw.order || 0,
    author_of_month: raw.author_of_month_detail ? mapAuthor(raw.author_of_month_detail) : null,
  }));
}

export async function getHeroSection(id: number): Promise<HeroSection | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/hero-sections/${id}/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const raw = await res.json();
    return {
      id: raw.id,
      title: raw.title || '',
      title_en: raw.title_en || '',
      title_ar: raw.title_ar || '',
      subtitle: raw.subtitle || '',
      subtitle_en: raw.subtitle_en || '',
      subtitle_ar: raw.subtitle_ar || '',
      description: raw.description || '',
      description_en: raw.description_en || '',
      description_ar: raw.description_ar || '',
      cta_label: raw.cta_label || '',
      cta_label_en: raw.cta_label_en || '',
      cta_label_ar: raw.cta_label_ar || '',
      cta_url: raw.cta_url || '',
      image: raw.image_url || raw.image || null,
      type: raw.type || 'main',
      order: raw.order || 0,
      author_of_month: raw.author_of_month_detail ? mapAuthor(raw.author_of_month_detail) : null,
    };
  } catch { return null; }
}

// ─── Press API ────────────────────────────────────────────────────────────────
export async function getPressItems(): Promise<Press[]> {
  const data = await djangoFetch<any[]>('/api/v1/press/', {
    ordering: '-publication_date',
  });
  return (Array.isArray(data) ? data : []).map((raw: any): Press => ({
    id: raw.id,
    title: raw.title || '',
    media_name: raw.media_name || '',
    publication_date: raw.publication_date || '',
    excerpt: raw.excerpt || '',
    article_url: raw.article_url || '',
    logo: raw.logo_url || raw.logo || null,
    featured: raw.featured || false,
    file_attachment: raw.file_attachment_url || raw.file_attachment || null,
  }));
}

// ─── Compatibility exports (used by some pages) ───────────────────────────────
export { getBooks as fetchBooks };
export const fetchAPI = djangoFetch;

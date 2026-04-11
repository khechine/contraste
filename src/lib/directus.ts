import seedData from './seed-data.json';
import { Book, Author, HeroSection, News } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getSeedBooks(): Book[] {
  return seedData.books.map((item, index) => {
    const seed = item as Record<string, unknown>;

    return {
      id: 1000 + index,
      title: String(seed.title || ''),
      title_en: String(seed.title_en || seed.title || ''),
      title_ar: String(seed.title_ar || seed.title || ''),
      slug: String(seed.slug || slugify(String(seed.title || ''))),
      author_id: null,
      author_name: String(seed.author_name || ''),
      description: String(seed.description || ''),
      description_en: String(seed.description_en || seed.description || ''),
      description_ar: String(seed.description_ar || seed.description || ''),
      cover_image: seed.cover ? String(seed.cover) : null,
      price_dt: Number(seed.price_dt || 0),
      price_eur: Number(seed.price_eur || 0),
      isbn: seed.isbn ? String(seed.isbn) : undefined,
      pages: seed.pages ? Number(seed.pages) : undefined,
      year: seed.year ? Number(seed.year) : undefined,
      language: seed.language ? String(seed.language) : undefined,
      category: seed.category ? String(seed.category) : undefined,
    };
  });
}

function getSeedAuthors(): Author[] {
  return seedData.authors.map((item, index) => {
    const seed = item as Record<string, unknown>;

    return {
      id: 1000 + index,
      name: String(seed.name || ''),
      name_en: seed.name_en ? String(seed.name_en) : undefined,
      slug: String(seed.slug || slugify(String(seed.name || ''))),
      bio: String(seed.bio_fr || ''),
      bio_en: String(seed.bio_en || seed.bio_fr || ''),
      bio_ar: String(seed.bio_ar || ''),
      image: seed.photo ? String(seed.photo) : null,
      photo: seed.photo ? String(seed.photo) : null,
    };
  });
}

function getSeedHeroSections(): HeroSection[] {
  return (seedData.hero_sections || []).map((item, index) => {
    const seed = item as Record<string, unknown>;

    return {
      id: 1000 + index,
      title: String(seed.title || ''),
      title_en: String(seed.title_en || seed.title || ''),
      title_ar: String(seed.title_ar || seed.title || ''),
      subtitle: String(seed.subtitle || ''),
      subtitle_en: String(seed.subtitle_en || seed.subtitle || ''),
      subtitle_ar: String(seed.subtitle_ar || seed.subtitle || ''),
      description: String(seed.description || ''),
      description_en: String(seed.description_en || seed.description || ''),
      description_ar: String(seed.description_ar || seed.description || ''),
      cta_label: String(seed.cta_label || seed.cta_label_en || seed.cta_label_ar || ''),
      cta_label_en: String(seed.cta_label_en || seed.cta_label || ''),
      cta_label_ar: String(seed.cta_label_ar || seed.cta_label || ''),
      cta_url: String(seed.cta_url || ''),
      image: seed.image ? String(seed.image) : null,
      type: String(seed.type || ''),
      order: Number(seed.order || index),
    };
  });
}

function getSeedNews(): News[] {
  return (seedData.news || []).map((item, index) => {
    const seed = item as Record<string, unknown>;

    return {
      id: 2000 + index,
      title: String(seed.title || ''),
      title_en: String(seed.title || ''),
      title_ar: String(seed.title || ''),
      slug: String(seed.slug || slugify(String(seed.title || ''))),
      content: String(seed.content || ''),
      content_en: String(seed.content || ''),
      content_ar: String(seed.content_ar || seed.content || ''),
      excerpt: String(seed.content || '').substring(0, 150),
      excerpt_en: String(seed.content || '').substring(0, 150),
      excerpt_ar: String(seed.content_ar || seed.content || '').substring(0, 150),
      image: seed.image ? String(seed.image) : null,
      date: seed.date ? String(seed.date) : null,
      author: seed.author ? String(seed.author) : undefined,
    };
  });
}

export async function fetchAPI<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/items/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }
  
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.warn(`Directus API returned ${res.status} for ${endpoint}`);
      return [] as unknown as T;
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return data.data;
    } catch (parseError: any) {
      console.error(`❌ JSON Parse Error for ${endpoint} at position ${parseError.message.match(/position (\d+)/)?.[1] || 'unknown'}`);
      console.error(`Raw beginning: ${text.substring(0, 100)}`);
      // Focus on the problematic position if mentioned in the error
      const posMatch = parseError.message.match(/position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        console.error(`Context at ${pos}: ...${text.substring(Math.max(0, pos - 20), pos + 20)}...`);
      }
      throw parseError; // Re-throw to show in Next.js logs
    }
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    return [] as unknown as T;
  }
}

export async function getBooks(limit: number = 500): Promise<Book[]> {
  const books = await fetchAPI<Book[]>('books', {
    limit: String(limit),
    fields: 'id,title,title_en,title_ar,slug,cover_image,cover_image.*,price_dt,price_eur,author_name,description,description_en,description_ar,status',
    sort: '-id',
  });
  return books || [];
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const fields = 'id,title,title_en,title_ar,slug,cover_image,cover_image.*,price_dt,price_eur,author_name,description,description_en,description_ar';
  
  const featuredBooks = await fetchAPI<Book[]>('books', { filter: `{"is_featured":{"_eq":true}}`, sort: '-id', fields }) || [];
  const latestBooks = await fetchAPI<Book[]>('books', { limit: '6', sort: '-id', fields }) || [];
  
  const allBooks = [...featuredBooks];
  const featuredIds = new Set(featuredBooks.map(b => b.id));
  
  for (const book of latestBooks) {
    if (!featuredIds.has(book.id)) {
      allBooks.push(book);
    }
  }

  if (allBooks.length > 0 || process.env.NODE_ENV === 'production') {
    return allBooks;
  }
  return getSeedBooks().slice(0, 6);
}

export async function getAuthorOfTheMonth(): Promise<Author | null> {
  const featuredAuthors = await fetchAPI<Author[]>('authors', { filter: `{"is_author_of_month":{"_eq":true}}`, limit: '1', sort: '-id' }) || [];
  if (featuredAuthors.length > 0) {
    return featuredAuthors[0];
  }

  const authors = await fetchAPI<Author[]>('authors', { limit: '1', sort: '-id' });
  if (authors.length > 0 || process.env.NODE_ENV === 'production') {
    return authors[0] || null;
  }
  const seedAuthors = getSeedAuthors();
  return seedAuthors.length > 0 ? seedAuthors[0] : null;
}

export async function getLatestBook(): Promise<Book | null> {
  const books = await fetchAPI<Book[]>('books', {
    limit: '1',
    sort: '-id',
    fields: 'id,title,title_en,title_ar,slug,cover_image,cover_image.*,price_dt,price_eur,author_name,description,description_en,description_ar',
  });
  return books && books.length > 0 ? books[0] : null;
}

export async function getBook(id: number): Promise<Book | null> {
  try {
    const books = await fetchAPI<Book[]>('books', { filter: `{"id":{"_eq":${id}}}`, fields: 'id,title,title_en,title_ar,slug,cover_image,cover_image.*,price_dt,price_eur,author_name,description,description_en,description_ar,author.*,category,year,pages,isbn,language' });
    return books[0] || null;
  } catch {
    return null;
  }
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  try {
    const books = await fetchAPI<Book[]>('books', { filter: `{"slug":{"_eq":"${slug}"}`, fields: 'id,title,title_en,title_ar,slug,cover_image,cover_image.*,price_dt,price_eur,author_name,description,description_en,description_ar,author.*,category,year,pages,isbn,language' });
    if (books.length > 0 || process.env.NODE_ENV === 'production') {
      return books[0] || null;
    }
    return getSeedBooks().find((book) => book.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function getAuthors(limit: number = 500): Promise<Author[]> {
  const authors = await fetchAPI<Author[]>('authors', {
    limit: String(limit),
    sort: 'name',
  });
  return authors || [];
}

export async function getAuthor(id: number): Promise<Author | null> {
  try {
    const authors = await fetchAPI<Author[]>('authors', { filter: `{"id":{"_eq":${id}}}` });
    if (authors.length > 0 || process.env.NODE_ENV === 'production') {
      return authors[0] || null;
    }
    return getSeedAuthors().find((author) => author.id === id) || null;
  } catch {
    return null;
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const authors = await fetchAPI<Author[]>('authors', { filter: `{"slug":{"_eq":"${slug}"}}` });
    if (authors.length > 0 || process.env.NODE_ENV === 'production') {
      return authors[0] || null;
    }
    return getSeedAuthors().find((author) => author.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function getNews(): Promise<News[]> {
  const news = await fetchAPI<News[]>('news', { sort: '-date', limit: '12' });
  if (news.length > 0 || process.env.NODE_ENV === 'production') {
    return news;
  }
  return getSeedNews();
}

export async function getLatestNews(limit = 3): Promise<News[]> {
  const news = await fetchAPI<News[]>('news', { sort: '-date', limit: String(limit) });
  if (news.length > 0 || process.env.NODE_ENV === 'production') {
    return news;
  }
  return getSeedNews().slice(0, limit);
}

export async function getFeaturedNews(limit = 3): Promise<News[]> {
  const news = await fetchAPI<News[]>('news', { limit: String(limit), sort: '-date' });
  if (news.length > 0 || process.env.NODE_ENV === 'production') {
    return news;
  }
  return getSeedNews().slice(0, limit);
}

export async function getHeroSections(): Promise<HeroSection[]> {
  const heroes = await fetchAPI<HeroSection[]>('hero_sections?sort=order&fields=*,author_of_month.*,author_of_month.books.*', { sort: 'order' });
  if (heroes.length > 0 || process.env.NODE_ENV === 'production') {
    return heroes;
  }
  return getSeedHeroSections();
}

export async function getHeroSection(id: number): Promise<HeroSection | null> {
  try {
    const items = await fetchAPI<HeroSection[]>('hero_sections', { filter: `{"id":{"_eq":${id}}}` });
    if (items.length > 0 || process.env.NODE_ENV === 'production') {
      return items[0] || null;
    }
    return getSeedHeroSections().find((hero) => hero.id === id) || null;
  } catch {
    return null;
  }
}

export async function getNewsItem(id: number): Promise<News | null> {
  try {
    const items = await fetchAPI<News[]>('news', { filter: `{"id":{"_eq":${id}}}` });
    return items[0] || null;
  } catch {
    return null;
  }
}

export async function getNewsItemBySlug(slug: string): Promise<News | null> {
  try {
    const items = await fetchAPI<News[]>('news', { filter: `{"slug":{"_eq":"${slug}"}}` });
    if (items.length > 0 || process.env.NODE_ENV === 'production') {
      return items[0] || null;
    }
    return getSeedNews().find((news) => news.slug === slug) || null;
  } catch {
    return null;
  }
}

export function getImageUrl(filename: string | null | undefined | { id: string; filename_disk: string }): string | null {
  if (!filename) return null;
  
  // Handle Directus file object (when cover_image.* is requested)
  if (typeof filename === 'object' && filename !== null && 'id' in filename && 'filename_disk' in filename) {
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus.contraste.tn';
    return `${directusUrl}/assets/${filename.filename_disk}`;
  }
  
  // Handle string filename
  const fn = filename as string;
  if (fn.startsWith('http://') || fn.startsWith('https://')) {
    return fn;
  }
  if (fn.startsWith('/')) {
    return fn;
  }
  return `/assets/${fn}`;
}

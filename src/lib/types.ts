import { Locale } from './i18n';

export interface Author {
  id: number;
  name: string;
  name_en?: string;
  slug: string;
  bio: string;
  bio_en: string;
  bio_ar: string;
  image: string | null;
  photo?: string | null;
  country?: string;
}

export interface Book {
  id: number;
  title: string;
  title_en: string;
  title_ar: string;
  slug: string;
  author_id: number | null;
  author_name: string;
  author?: Author | null;
  description: string;
  description_en: string;
  description_ar: string;
  cover_image: string | null;
  price_dt: number;
  price_eur: number;
  date_published?: string | null;
  isbn?: string;
  pages?: number;
  year?: number;
  language?: string;
  category?: string;
}

export interface News {
  id: number;
  title: string;
  title_en: string;
  title_ar: string;
  slug: string;
  content: string;
  content_en: string;
  content_ar: string;
  excerpt: string;
  excerpt_en: string;
  excerpt_ar: string;
  image: string | null;
  date: string | null;
  author?: string;
}

export interface HeroSection {
  id: number;
  title: string;
  title_en: string;
  title_ar: string;
  subtitle: string;
  subtitle_en: string;
  subtitle_ar: string;
  description: string;
  description_en: string;
  description_ar: string;
  cta_label: string;
  cta_label_en: string;
  cta_label_ar: string;
  cta_url: string;
  image: string | null;
  type: string;
  order: number;
  author_of_month?: Author | null;
}

export interface CollectionFiles {
  books_file: {
    directus_files_id: string;
  };
}

export type ContentType = 'book' | 'author' | 'news';

export interface LocalizedContent {
  locale: Locale;
}

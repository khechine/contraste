export const locales = ['fr', 'en', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocalizedField<T>(
  item: T,
  locale: Locale,
  fieldFr: keyof T,
  fieldEn: keyof T,
  fieldAr: keyof T
): string {
  const fieldMap = {
    fr: fieldFr,
    en: fieldEn,
    ar: fieldAr,
  };
  return (item[fieldMap[locale]] as string) || '';
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar';
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

export function getBooksRoute(locale: Locale): string {
  return locale === 'en' ? 'books' : 'livres';
}

export function getAuthorsRoute(locale: Locale): string {
  return locale === 'fr' ? 'auteurs' : 'authors';
}

export function getNewsRoute(locale: Locale): string {
  return locale === 'fr' ? 'actualites' : 'news';
}

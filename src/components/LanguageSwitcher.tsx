'use client';

import Link from 'next/link';
import { Locale, locales, localeNames } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  pathname: string;
}

export default function LanguageSwitcher({ currentLocale, pathname }: LanguageSwitcherProps) {
  const getLocalizedPath = (newLocale: Locale) => {
    const pathParts = pathname.split('/');
    pathParts[1] = newLocale;
    return pathParts.join('/');
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalizedPath(locale)}
          className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
            locale === currentLocale
              ? 'bg-black text-white'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  );
}

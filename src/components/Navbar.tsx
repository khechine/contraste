'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Locale, localeNames } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { CONTRASTE_CONFIG } from '@/lib/contraste-config';

interface NavbarProps {
  locale: Locale;
}

const navLinks = {
  fr: [
    { href: '/fr/livres', label: 'Livres' },
    { href: '/fr/auteurs', label: 'Auteurs' },
    { href: '/fr/actualites', label: 'Actualités' },
    { href: '/fr/a-propos', label: 'À propos' },
    { href: '/fr/contact', label: 'Contact' },
  ],
  en: [
    { href: '/en/books', label: 'Books' },
    { href: '/en/authors', label: 'Authors' },
    { href: '/en/news', label: 'News' },
    { href: '/en/about-us', label: 'About' },
    { href: '/en/contact', label: 'Contact' },
  ],
  ar: [
    { href: '/ar/books', label: 'الكتب' },
    { href: '/ar/authors', label: 'المؤلفون' },
    { href: '/ar/news', label: 'الأخبار' },
    { href: '/ar/about-us', label: 'من نحن' },
    { href: '/ar/contact', label: 'اتصل بنا' },
  ],
};

export default function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname();
  const links = navLinks[locale];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <img 
              src="/logo-contraste-retina.svg" 
              alt="Contraste Éditions" 
              className="h-8 w-auto sm:h-10 transition-transform hover:scale-105"
              width={140}
              height={98}
            />
            <span className="text-xl font-serif font-bold tracking-tight hidden sm:inline">Contraste Éditions</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors ${
                    isActive ? 'text-black' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <LanguageSwitcher currentLocale={locale} pathname={pathname} />
        </div>
      </div>
    </nav>
  );
}

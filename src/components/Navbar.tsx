'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  locale: Locale;
}

const navLinks = {
  fr: [
    { href: '/fr/livres', label: 'Livres' },
    { href: '/fr/auteurs', label: 'Auteurs' },
    { href: '/fr/actualites', label: 'Actualités' },
    { href: '/fr/press', label: 'Presse' },
    { href: '/fr/a-propos', label: 'À propos' },
    { href: '/fr/contact', label: 'Contact' },
  ],
  en: [
    { href: '/en/books', label: 'Books' },
    { href: '/en/authors', label: 'Authors' },
    { href: '/en/news', label: 'News' },
    { href: '/en/press', label: 'Press' },
    { href: '/en/about-us', label: 'About' },
    { href: '/en/contact', label: 'Contact' },
  ],
  ar: [
    { href: '/ar/books', label: 'الكتب' },
    { href: '/ar/authors', label: 'المؤلفون' },
    { href: '/ar/news', label: 'الأخبار' },
    { href: '/ar/press', label: 'الصحافة' },
    { href: '/ar/about-us', label: 'من نحن' },
    { href: '/ar/contact', label: 'اتصل بنا' },
  ],
};

export default function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const links = navLinks[locale];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <img 
              src="/logo-contraste-retina.svg" 
              alt="Contraste Éditions" 
              className="h-8 w-auto sm:h-10 transition-transform hover:scale-105"
            />
            <span className="text-xl font-serif font-bold tracking-tight hidden sm:inline">Contraste Éditions</span>
          </Link>

          {/* Desktop Links */}
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

          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} pathname={pathname} />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-black focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-4 text-base font-medium border-b border-gray-50 ${
                      isActive ? 'text-black font-semibold' : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

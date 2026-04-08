'use client';

import { motion } from 'framer-motion';
import { AuthorCard } from './Cards';
import { Locale, getAuthorsRoute } from '@/lib/i18n';
import { Author } from '@/lib/types';
import Link from 'next/link';

interface AnimatedAuthorsProps {
  authors: Author[];
  locale: Locale;
  titles: {
    title: string;
    subtitle: string;
  };
}

export default function AnimatedAuthors({
  authors,
  locale,
  titles,
}: AnimatedAuthorsProps) {
  return (
    <div className="min-h-screen">
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-serif font-bold mb-4"
          >
            {titles.title}
          </motion.h1>
          <p className="text-lg text-gray-600">{titles.subtitle}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {authors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {authors.map((author) => (
              <Link key={author.id} href={`/${locale}/${getAuthorsRoute(locale)}/${author.slug}`}>
                <AuthorCard author={author} locale={locale} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            {locale === 'fr' ? 'Aucun auteur disponible pour le moment.' : 
             locale === 'en' ? 'No authors available at the moment.' : 
             'لا توجد مؤلفون متاحون حالياً.'}
          </p>
        )}
      </section>
    </div>
  );
}

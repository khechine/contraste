'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { NewsCard } from './Cards';
import { Locale, getNewsRoute } from '@/lib/i18n';
import { News } from '@/lib/types';

interface AnimatedNewsProps {
  news: News[];
  locale: Locale;
  titles: {
    title: string;
    subtitle: string;
  };
}

export default function AnimatedNews({
  news,
  locale,
  titles,
}: AnimatedNewsProps) {
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
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <Link key={item.id} href={`/${locale}/${getNewsRoute(locale)}/${item.slug}`}>
                <NewsCard news={item} locale={locale} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            {locale === 'fr' ? 'Aucune actualité disponible pour le moment.' : 
             locale === 'en' ? 'No news available at the moment.' : 
             'لا توجد أخبار متاحة حالياً.'}
          </p>
        )}
      </section>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Book } from '@/lib/types';
import { Locale, getLocalizedField, getBooksRoute } from '@/lib/i18n';
import { getImageUrl } from '@/lib/directus';

interface LatestBookShowcaseProps {
  book: Book | null;
  locale: Locale;
  bookLinks: string;
}

export default function LatestBookShowcase({
  book,
  locale,
  bookLinks,
}: LatestBookShowcaseProps) {
  if (!book) return null;

  const title = getLocalizedField(book, locale, 'title', 'title_en', 'title_ar');
  const description = getLocalizedField(book, locale, 'description', 'description_en', 'description_ar');
  const coverUrl = getImageUrl(book.cover_image);
  
  const authorName = typeof book.author === 'object' && book.author?.name 
    ? book.author.name 
    : book.author_name || '';

  const labels = {
    fr: { by: 'par', discoverMore: 'Lire plus' },
    en: { by: 'by', discoverMore: 'Read more' },
    ar: { by: 'بواسطة', discoverMore: 'اقرأ المزيد' },
  };

  const lbl = labels[locale];
  const bookUrl = `/${locale}/${getBooksRoute(locale)}/${book.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="group rounded-2xl overflow-hidden bg-white shadow-xl ring-1 ring-black/5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Book Cover */}
        <div className="relative h-96 lg:h-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {coverUrl ? (
            <Link href={bookUrl} className="absolute inset-0 block h-full w-full">
              <Image
                src={coverUrl}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                priority
              />
            </Link>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
              <svg className="w-24 h-24 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-600 font-semibold mb-3">
              {locale === 'fr' ? 'Dernière parution' : locale === 'en' ? 'Latest release' : 'آخر إصدار'}
            </p>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-4">
              {title}
            </h2>
            
            {authorName && (
              <p className="text-lg text-slate-600 mb-6">
                {lbl.by} <span className="font-semibold">{authorName}</span>
              </p>
            )}

            <div 
              className="text-base text-slate-600 leading-relaxed mb-6 line-clamp-4"
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {/* Book Details */}
            <div className="flex flex-wrap gap-6 text-sm mb-8">
              {book.year && (
                <div>
                  <span className="text-slate-500">{locale === 'fr' ? 'Année' : locale === 'en' ? 'Year' : 'السنة'}:</span>
                  <p className="font-semibold text-slate-900">{book.year}</p>
                </div>
              )}
              {book.category && (
                <div>
                  <span className="text-slate-500">{locale === 'fr' ? 'Catégorie' : locale === 'en' ? 'Category' : 'الفئة'}:</span>
                  <p className="font-semibold text-slate-900">{book.category}</p>
                </div>
              )}
              {book.pages && (
                <div>
                  <span className="text-slate-500">{locale === 'fr' ? 'Pages' : locale === 'en' ? 'Pages' : 'الصفحات'}:</span>
                  <p className="font-semibold text-slate-900">{book.pages}</p>
                </div>
              )}
            </div>

            {/* Prices */}
            {(book.price_dt || book.price_eur) && (
              <div className="flex gap-4 mb-8">
                {book.price_dt && (
                  <span className="text-2xl font-bold text-slate-900">{book.price_dt} DT</span>
                )}
                {book.price_eur && (
                  <span className="text-lg text-slate-500">{book.price_eur} €</span>
                )}
              </div>
            )}

            <Link
              href={bookUrl}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors"
            >
              {lbl.discoverMore} →
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

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
  }[locale];

  const bookUrl = `/${locale}/${getBooksRoute(locale)}/${book.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="group rounded-3xl overflow-hidden bg-white shadow-xl ring-1 ring-black/5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Book Cover */}
        <div className="relative h-72 sm:h-96 lg:h-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          {coverUrl ? (
            <Link href={bookUrl} className="absolute inset-0 block h-full w-full">
              <Image
                src={coverUrl}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </Link>
          ) : (
            <div className="absolute inset-0 bg-slate-200" />
          )}
        </div>

        {/* Book Info */}
        <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-blue-600 font-bold mb-3">
              {locale === 'fr' ? 'Dernière parution' : locale === 'en' ? 'Latest release' : 'آخر إصدار'}
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 mb-4 leading-tight">
              {title}
            </h2>
            
            {authorName && (
              <p className="text-lg text-slate-600 mb-6 font-medium">
                {labels.by} <span className="text-slate-900">{authorName}</span>
              </p>
            )}

            <div 
              className="text-base text-slate-600 leading-relaxed mb-8 line-clamp-4 lg:line-clamp-6"
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {/* Book Details */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 text-sm mb-10">
              {book.year && (
                <div>
                  <span className="text-slate-400 block mb-1">{locale === 'fr' ? 'Année' : locale === 'en' ? 'Year' : 'السنة'}</span>
                  <p className="font-bold text-slate-900">{book.year}</p>
                </div>
              )}
              {book.category && (
                <div>
                  <span className="text-slate-400 block mb-1">{locale === 'fr' ? 'Catégorie' : locale === 'en' ? 'Category' : 'الفئة'}</span>
                  <p className="font-bold text-slate-900 line-clamp-1">{book.category}</p>
                </div>
              )}
            </div>

            <Link
              href={bookUrl}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all hover:gap-3 active:scale-95 shadow-lg shadow-slate-200"
            >
              {labels.discoverMore} →
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

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
    fr: { by: 'par', discoverMore: 'Lire plus', latestRelease: 'Dernière parution' },
    en: { by: 'by', discoverMore: 'Read more', latestRelease: 'Latest release' },
    ar: { by: 'بواسطة', discoverMore: 'اقرأ المزيد', latestRelease: 'آخر إصدار' },
  }[locale];

  const bookUrl = `/${locale}/${getBooksRoute(locale)}/${book.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:shadow-blue-900/10"
    >
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left: Book Cover Container */}
        <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-full overflow-hidden bg-slate-50 group">
          {coverUrl ? (
            <Link href={bookUrl} className="absolute inset-0 block h-full w-full">
              <Image
                src={coverUrl}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <span className="text-slate-300 font-serif italic text-2xl">Cover Image</span>
            </div>
          )}
        </div>

        {/* Right: Book Content */}
        <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 sm:space-y-8 bg-white relative z-10">
          <div className="space-y-4">
            <span className="inline-flex py-1.5 px-3 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              {labels.latestRelease}
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 leading-tight">
              {title}
            </h2>
            {authorName && (
              <p className="text-lg sm:text-xl text-slate-600 font-medium italic">
                {labels.by} <span className="text-slate-900 not-italic font-bold">{authorName}</span>
              </p>
            )}
          </div>

          <div 
            className="text-base sm:text-lg text-slate-600 line-clamp-4 lg:line-clamp-none lg:max-h-64 overflow-hidden leading-relaxed custom-scrollbar prose prose-slate prose-sm sm:prose-base max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          <div className="flex flex-wrap gap-4 sm:gap-8 border-t border-slate-100 pt-8 mt-4">
             {book.year && (
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-wider">{locale === 'fr' ? 'Année' : locale === 'en' ? 'Year' : 'السنة'}</span>
                <p className="text-lg font-serif font-bold text-slate-800">{book.year}</p>
              </div>
            )}
            {book.category && (
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-wider">{locale === 'fr' ? 'Catégorie' : locale === 'en' ? 'Category' : 'الفئة'}</span>
                <p className="text-lg font-serif font-bold text-slate-800">{book.category}</p>
              </div>
            )}
            {book.pages && (
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-bold uppercase tracking-wider">{locale === 'fr' ? 'Pages' : locale === 'en' ? 'Pages' : 'الصفحات'}</span>
                <p className="text-lg font-serif font-bold text-slate-800">{book.pages}</p>
              </div>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="pt-4"
          >
            <Link
              href={bookUrl}
              className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white text-base font-bold rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              {labels.discoverMore}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

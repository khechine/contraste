'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '@/lib/types';
import { Locale, getLocalizedField, getBooksRoute } from '@/lib/i18n';
import { getImageUrl } from '@/lib/directus';

interface BooksCarouselHeroProps {
  books: Book[];
  locale: Locale;
  bookLinks: string;
}
const GENERIC_BOOK_IMAGE = null;
export default function BooksCarouselHero({ books, locale, bookLinks }: BooksCarouselHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  if (!books || books.length === 0) return null;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + books.length) % books.length);
    setIsAutoPlay(false);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlay) {
      const timer = setTimeout(() => setIsAutoPlay(true), 10000);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, books.length]);

  const currentBook = books[currentIndex];
  const title = getLocalizedField(currentBook, locale, 'title', 'title_en', 'title_ar');
  const description = getLocalizedField(currentBook, locale, 'description', 'description_en', 'description_ar');
  const coverUrl = getImageUrl(currentBook.cover_image);
  const heroImage = coverUrl || undefined;
  const authorName = typeof currentBook.author === 'object' && currentBook.author?.name 
    ? currentBook.author.name 
    : currentBook.author_name || '';
  const bookUrl = `/${locale}/${getBooksRoute(locale)}/${currentBook.slug}`;

  const labels = {
    fr: { newBook: 'Nouveau livre', by: 'par', discover: 'Découvrir' },
    en: { newBook: 'New book', by: 'by', discover: 'Discover' },
    ar: { newBook: 'كتاب جديد', by: 'بواسطة', discover: 'اكتشف' },
  };

  const lbl = labels[locale];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {coverUrl && (
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover blur-md opacity-30"
                priority
                unoptimized
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Book Cover - Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex justify-center lg:justify-start"
                >
                  <div className="relative w-48 sm:w-56 lg:w-72 aspect-[3/4] rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/20">
                    <Image
                      src={heroImage || '/images/hero-placeholder.svg'}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                </motion.div>

                {/* Book Info - Right */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-white lg:text-left"
                >
                  <p className="text-sm uppercase tracking-[0.24em] text-blue-400 font-semibold mb-4">
                    {lbl.newBook}
                  </p>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-4 leading-tight">
                    {title}
                  </h1>

                  {authorName && (
                    <p className="text-base sm:text-lg text-slate-300 mb-6">
                      {lbl.by} <span className="font-semibold text-white">{authorName}</span>
                    </p>
                  )}

                  <div 
                    className="text-base sm:text-lg text-slate-200 leading-relaxed mb-8 max-w-lg line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />

                  {/* Book Meta */}
                  <div className="flex flex-wrap gap-6 text-sm mb-8">
                    {currentBook.year && (
                      <div>
                        <span className="text-slate-400">{locale === 'fr' ? 'Année' : locale === 'en' ? 'Year' : 'السنة'}</span>
                        <p className="font-semibold text-white">{currentBook.year}</p>
                      </div>
                    )}
                    {currentBook.category && (
                      <div>
                        <span className="text-slate-400">{locale === 'fr' ? 'Catégorie' : locale === 'en' ? 'Category' : 'الفئة'}</span>
                        <p className="font-semibold text-white">{currentBook.category}</p>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={bookUrl}
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    {lbl.discover} →
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => paginate(-1)}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
        aria-label="Previous book"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => paginate(1)}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
        aria-label="Next book"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {books.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
              setIsAutoPlay(false);
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-blue-400 w-8'
                : 'bg-white/30 w-2 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            aria-label={`Go to book ${index + 1}`}
          />
        ))}
      </div>

      {/* View All Link */}
      <Link
        href={bookLinks}
        className="absolute top-8 right-8 z-20 text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
      >
        {locale === 'fr' ? 'Voir tous les livres' : locale === 'en' ? 'View all books' : 'عرض جميع الكتب'} →
      </Link>
    </section>
  );
}

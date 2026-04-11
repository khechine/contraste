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

export default function BooksCarouselHero({ books, locale, bookLinks }: BooksCarouselHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  if (!books || books.length === 0) return null;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + books.length) % books.length);
    setIsAutoPlay(false);
  };

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
  const authorName = typeof currentBook.author === 'object' && currentBook.author?.name 
    ? currentBook.author.name 
    : currentBook.author_name || '';
  const bookUrl = `/${locale}/${getBooksRoute(locale)}/${currentBook.slug}`;

  const labels = {
    fr: { newBook: 'Nouveau livre', by: 'par', discover: 'Découvrir' },
    en: { newBook: 'New book', by: 'by', discover: 'Discover' },
    ar: { newBook: 'كتاب جديد', by: 'بواسطة', discover: 'اكتشف' },
  }[locale];

  return (
    <section className="relative min-h-[80vh] md:min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction < 0 ? 300 : -300, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          {/* Background Blurred Image */}
          <div className="absolute inset-0 z-0">
            {coverUrl && (
              <Image
                src={coverUrl}
                alt=""
                fill
                className="object-cover blur-xl opacity-20 scale-110"
                unoptimized
              />
            )}
            <div className="absolute inset-0 bg-slate-950/60" />
          </div>

          <div className="relative h-full flex items-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 z-10">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Book Cover */}
                <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                  <div className="relative w-40 sm:w-56 lg:w-80 aspect-[3/4] rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform lg:rotate-3 hover:rotate-0 transition-transform duration-500 ring-1 ring-white/10">
                    <Image
                      src={coverUrl || '/images/hero-placeholder.svg'}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="order-2 lg:order-1 text-center lg:text-left space-y-4 sm:space-y-6">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                      {labels.newBook}
                    </span>
                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-serif font-bold text-white mb-4 leading-tight tracking-tight">
                      {title}
                    </h1>
                    {authorName && (
                      <p className="text-lg sm:text-xl text-slate-300">
                        {labels.by} <span className="text-white font-medium">{authorName}</span>
                      </p>
                    )}
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3 }}
                    className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 line-clamp-3 md:line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-4 sm:pt-6">
                    <Link
                      href={bookUrl}
                      className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-white/10 active:scale-95 group"
                    >
                      {labels.discover}
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-4 right-4 sm:left-12 sm:right-auto z-30 flex items-center gap-4">
        <div className="flex gap-2">
          {books.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); setIsAutoPlay(false); }}
              className={`h-1.5 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

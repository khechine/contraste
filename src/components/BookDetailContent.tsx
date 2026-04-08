'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Author, Book } from '@/lib/types';
import { Locale, getLocalizedField, getBooksRoute, getAuthorsRoute } from '@/lib/i18n';
import { getImageUrl } from '@/lib/directus';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import OrderFormModal from './OrderFormModal';

interface BookDetailContentProps {
  book: Book;
  locale: Locale;
  authorBooks: Book[];
  relatedBooks: Book[];
  labels: Record<Locale, Record<string, string>>;
  allBooks?: Book[];
}

export default function BookDetailContent({
  book,
  locale,
  authorBooks,
  relatedBooks,
  labels,
  allBooks = [],
}: BookDetailContentProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const title = getLocalizedField(book, locale, 'title', 'title_en', 'title_ar');
  const description = getLocalizedField(book, locale, 'description', 'description_en', 'description_ar');
  const lbl = labels[locale] || { cta_order: 'Commander' };
  const coverUrl = getImageUrl(book.cover_image);
  const bookLinks = { fr: '/fr/livres', en: '/en/books', ar: '/ar/books' };

  const suggestions = useMemo(() => {
    if (allBooks.length === 0) return [];
    return allBooks
      .filter(b => b.id !== book.id && b.author_name !== book.author_name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [allBooks, book.id]);

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href={bookLinks[locale]} className="text-sm text-gray-500 hover:text-black mb-8 inline-block">
          ← {lbl.backToBooks}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[2/3] max-w-md mx-auto lg:mx-0 bg-gray-100 rounded-lg overflow-hidden"
          >
            {coverUrl ? (
              <Image 
                src={coverUrl} 
                alt={title} 
                fill 
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw" 
                className="object-cover" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4">{title}</h1>
            
            {book.author_name && (
              <Link 
                href={`/${locale}/${getAuthorsRoute(locale)}`}
                className="text-lg text-gray-600 mb-6 hover:text-black transition-colors block"
              >
                {lbl.by}{' '}
                <span className="font-medium underline underline-offset-2">{book.author_name}</span>
              </Link>
            )}

            <div className="flex flex-wrap gap-4 mb-8">
              {book.price_dt && (
                <div className="text-2xl font-bold">{Number(book.price_dt).toFixed(2)} DT</div>
              )}
              {book.price_eur && (
                <div className="text-xl text-gray-500">| {Number(book.price_eur).toFixed(2)} €</div>
              )}
            </div>

            <div className="mb-8">
              <motion.button
                onClick={() => setShowOrderModal(true)}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 focus:outline-none focus:ring-4 focus:ring-emerald-200"
              >
                {lbl.cta_order || 'Commander'}
              </motion.button>
            </div>

            <OrderFormModal
              isOpen={showOrderModal}
              onClose={() => setShowOrderModal(false)}
              book={book}
              locale={locale}
              labels={lbl}
            />

            {book.date_published && (
              <p className="text-sm text-gray-500 mb-6">
                {lbl.publicationDate}: {new Date(book.date_published).toLocaleDateString(locale === 'ar' ? 'ar-TN' : locale)}
              </p>
            )}

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {book.category && (
                  <div>
                    <span className="text-gray-500">Catégorie:</span>
                    <p className="font-medium">{book.category}</p>
                  </div>
                )}
                {book.year && (
                  <div>
                    <span className="text-gray-500">Année:</span>
                    <p className="font-medium">{book.year}</p>
                  </div>
                )}
                {book.pages && (
                  <div>
                    <span className="text-gray-500">Pages:</span>
                    <p className="font-medium">{book.pages}</p>
                  </div>
                )}
                {book.language && (
                  <div>
                    <span className="text-gray-500">Langue:</span>
                    <p className="font-medium">{book.language}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {authorBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-serif font-bold mb-8">
              {lbl.otherBooksBy} {book.author_name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {authorBooks.map((relatedBook) => {
                const bookUrl = getImageUrl(relatedBook.cover_image);
                return (
                  <Link key={relatedBook.id} href={`/${locale}/${getBooksRoute(locale)}/${relatedBook.slug}`}>
                    <div className="group">
                      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 rounded-lg mb-4">
                        {bookUrl ? (
                          <Image
                            src={bookUrl}
                            alt={getLocalizedField(relatedBook, locale, 'title', 'title_en', 'title_ar')}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm group-hover:underline">
                        {getLocalizedField(relatedBook, locale, 'title', 'title_en', 'title_ar')}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        {relatedBook.price_dt && <span className="text-sm font-medium">{Number(relatedBook.price_dt).toFixed(2)} DT</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {relatedBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-serif font-bold mb-8">{lbl.similarBooks}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => {
                const bookUrl = getImageUrl(relatedBook.cover_image);
                return (
                  <Link key={relatedBook.id} href={`/${locale}/${getBooksRoute(locale)}/${relatedBook.slug}`}>
                    <div className="group">
                      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 rounded-lg mb-4">
                        {bookUrl ? (
                          <Image
                            src={bookUrl}
                            alt={getLocalizedField(relatedBook, locale, 'title', 'title_en', 'title_ar')}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm group-hover:underline">
                        {getLocalizedField(relatedBook, locale, 'title', 'title_en', 'title_ar')}
                      </h3>
                      {relatedBook.author_name && (
                        <p className="text-xs text-gray-500 mt-1">{relatedBook.author_name}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {relatedBook.price_dt && <span className="text-sm font-medium">{Number(relatedBook.price_dt).toFixed(2)} DT</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">✨</span>
                <h2 className="text-2xl font-serif font-bold">
                  {locale === 'fr' ? 'Vous aimerez aussi' : locale === 'en' ? 'You might also like' : 'قد يعجبك أيضاً'}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {suggestions.map((suggestedBook) => {
                  const bookUrl = getImageUrl(suggestedBook.cover_image);
                  return (
                    <Link key={suggestedBook.id} href={`/${locale}/${getBooksRoute(locale)}/${suggestedBook.slug}`}>
                      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                          {bookUrl ? (
                            <Image
                              src={bookUrl}
                              alt={getLocalizedField(suggestedBook, locale, 'title', 'title_en', 'title_ar')}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-serif font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                            {getLocalizedField(suggestedBook, locale, 'title', 'title_en', 'title_ar')}
                          </h3>
                          {suggestedBook.author_name && (
                            <p className="text-xs text-gray-500">{suggestedBook.author_name}</p>
                          )}
                          <div className="mt-2">
                            {suggestedBook.price_dt && (
                              <span className="text-sm font-bold text-gray-900">{Number(suggestedBook.price_dt).toFixed(2)} DT</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}

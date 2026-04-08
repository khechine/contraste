'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Book, Author, News } from '@/lib/types';
import { Locale, getLocalizedField } from '@/lib/i18n';
import { getImageUrl } from '@/lib/directus';

interface BookCardProps {
  book: Book;
  locale: Locale;
}

export function BookCard({ book, locale }: BookCardProps) {
  const title = getLocalizedField(book, locale, 'title', 'title_en', 'title_ar');
  const description = getLocalizedField(book, locale, 'description', 'description_en', 'description_ar');
  const coverUrl = getImageUrl(book.cover_image);
  const booksPath = locale === 'en' ? 'books' : 'livres';

  const labels = {
    see: locale === 'fr' ? 'Voir' : locale === 'en' ? 'View' : 'عرض',
    order: locale === 'fr' ? 'Commander' : locale === 'en' ? 'Order' : 'اطلب',
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
    >
      <Link href={`/${locale}/${booksPath}/${book.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100" style={{ position: 'relative' }}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/${locale}/${booksPath}/${book.slug}`} className="block">
          <h3 className="font-serif font-semibold text-base text-gray-900 line-clamp-2 leading-snug mb-1 min-h-[2.5rem]">
            {title}
          </h3>
        </Link>
        
        {book.author_name && (
          <Link 
            href={`/${locale}/${locale === 'en' ? 'authors' : 'auteurs'}`}
            className="text-sm text-gray-500 mb-2 font-medium hover:text-black transition-colors"
          >
            {book.author_name}
          </Link>
        )}
        
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 mb-3">
            {book.price_dt && (
              <span className="text-xl font-bold text-gray-900">{Number(book.price_dt).toFixed(2)}</span>
            )}
            {book.price_dt && <span className="text-sm font-semibold text-gray-600">DT</span>}
            {book.price_eur && (
              <span className="text-sm text-gray-400">| {Number(book.price_eur).toFixed(2)} €</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link 
              href={`/${locale}/${booksPath}/${book.slug}`}
              className="flex-1 text-center text-sm font-semibold bg-gray-100 text-gray-800 px-3 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {labels.see}
            </Link>
            <Link 
              href={`/${locale}/contact`}
              className="flex-1 text-center text-sm font-semibold bg-black text-white px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
            >
              {labels.order}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface AuthorCardProps {
  author: Author;
  locale: Locale;
}

export function AuthorCard({ author, locale }: AuthorCardProps) {
  const bio = locale === 'ar' ? author.bio_ar : author.bio;
  const photoUrl = getImageUrl(author.image);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group text-center"
    >
      <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full bg-gray-100" style={{ position: 'relative' }}>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={author.name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
      <h3 className="font-medium">{author.name}</h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{bio}</p>
    </motion.div>
  );
}

interface NewsCardProps {
  news: News;
  locale: Locale;
}

export function NewsCard({ news, locale }: NewsCardProps) {
  const title = news.title;
  const content = locale === 'ar' ? news.content_ar : news.content;
  const imageUrl = getImageUrl(news.image);
  const date = news.date ? new Date(news.date).toLocaleDateString(locale === 'ar' ? 'ar-TN' : locale) : '';

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100 rounded-lg mb-4" style={{ position: 'relative' }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
      </div>
      {date && <p className="text-xs text-gray-500 mb-2">{date}</p>}
      <h3 className="font-medium group-hover:underline">{title}</h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{content}</p>
    </motion.article>
  );
}

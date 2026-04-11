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
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
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

export function AuthorCard({ author, locale }: { author: Author; locale: Locale }) {
  const bio = locale === 'ar' ? author.bio_ar : author.bio;
  const photoUrl = getImageUrl(author.image || author.photo);

  return (
    <motion.div whileHover={{ y: -4 }} className="group text-center">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 overflow-hidden rounded-full bg-gray-100">
        {photoUrl ? (
          <Image src={photoUrl} alt={author.name} fill unoptimized className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-slate-50">
            <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-sm sm:text-base text-slate-900">{author.name}</h3>
      {bio && (
        <div 
          className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 md:line-clamp-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: bio }}
        />
      )}
    </motion.div>
  );
}

export function NewsCard({ news, locale }: { news: News; locale: Locale }) {
  const title = news.title;
  const content = locale === 'ar' ? news.content_ar : news.content;
  const imageUrl = getImageUrl(news.image);
  const date = news.date ? new Date(news.date).toLocaleDateString(locale === 'ar' ? 'ar-TN' : locale) : '';

  return (
    <motion.article whileHover={{ y: -4 }} className="group cursor-pointer">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 rounded-2xl mb-4">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-slate-800" />
        )}
      </div>
      {date && <p className="text-[10px] uppercase font-bold text-blue-600 mb-2 tracking-widest">{date}</p>}
      <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">{title}</h3>
      {content && (
        <div 
          className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </motion.article>
  );
}

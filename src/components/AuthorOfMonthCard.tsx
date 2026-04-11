'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Author, Book } from '@/lib/types';
import { Locale, getLocalizedField, getAuthorsRoute } from '@/lib/i18n';
import { BookCard } from './Cards';

interface AuthorOfMonthCardProps {
  author: Author;
  locale: Locale;
}

function AuthorOfMonthCard({ author, locale }: AuthorOfMonthCardProps) {
  const name = locale === 'en' ? author.name_en || author.name : author.name;
  const bio = locale === 'en' ? author.bio_en || author.bio : author.bio_ar || author.bio;
  const authorRoute = getAuthorsRoute(locale);

  const authorImage = author.photo || author.image;

  // Demo books
  const demoBooks: Book[] = [
    { id: 1, title: "Kairouan et ses saints", slug: 'kairouan-saints', author_name: name, cover_image: null, price_dt: 25, price_eur: 25, title_en: "", title_ar: "", description: "", description_en: "", description_ar: "", author_id: author.id },
    { id: 2, title: "La ville sainte", slug: 'la-ville-sainte', author_name: name, cover_image: null, price_dt: 20, price_eur: 20, title_en: "", title_ar: "", description: "", description_en: "", description_ar: "", author_id: author.id },
    { id: 3, title: "Lectures hagiographiques", slug: 'lectures-hagiographiques', author_name: name, cover_image: null, price_dt: 18, price_eur: 18, title_en: "", title_ar: "", description: "", description_en: "", description_ar: "", author_id: author.id },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border hover:border-sky-200"
    >
      <div className="p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-shrink-0">
            <div className="relative w-40 h-56 rounded-2xl overflow-hidden ring-2 ring-gray-200/50 group-hover:ring-sky-300/70">
              {authorImage ? (
                  <Image
                    src={`/assets/${authorImage}`}
                    alt={name || "Photo de l'auteur"}
                    fill
                    sizes="(max-width: 768px) 160px, 160px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-3xl font-serif font-bold text-slate-600">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight group-hover:text-sky-900 mb-3">
                {name}
              </h2>
              <div 
                className="text-lg text-slate-600 leading-relaxed line-clamp-4 lg:line-clamp-5 pr-4"
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            </div>

            <div className="pt-6 pb-4 border-t border-gray-200">
              <Link
                href={`/${locale}/${authorRoute}/${author.slug}`}
                className="group/link inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-300 hover:scale-[1.02]"
              >
                Découvrir l&apos;auteur →
              </Link>
            </div>
          </div>

          <div className="lg:w-64 space-y-4 self-start">
            <h4 className="font-serif text-lg font-semibold text-gray-900 uppercase tracking-wide">
              Ses œuvres
            </h4>
            <div className="space-y-3">
              {demoBooks.map((book) => (
                <div key={book.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-12 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg overflow-hidden" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm line-clamp-1">{book.title}</h5>
                    <p className="text-xs text-gray-500">{book.price_dt} DT</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default AuthorOfMonthCard;


'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookCard } from './Cards';
import { Locale } from '@/lib/i18n';
import { Book } from '@/lib/types';

interface AnimatedBooksProps {
  books: Book[];
  locale: Locale;
  titles: {
    title: string;
    subtitle: string;
  };
  bookLink: string;
}

export default function AnimatedBooks({
  books,
  locale,
  titles,
}: AnimatedBooksProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');

  const authors = useMemo(() => {
    const authorSet = new Set(books.map(b => b.author_name).filter(Boolean));
    return Array.from(authorSet).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = searchQuery === '' || 
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.title_ar?.includes(searchQuery) ||
        book.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAuthor = selectedAuthor === '' || book.author_name === selectedAuthor;
      
      return matchesSearch && matchesAuthor;
    });
  }, [books, searchQuery, selectedAuthor]);

  const labels = {
    search: locale === 'fr' ? 'Rechercher un livre...' : locale === 'en' ? 'Search for a book...' : 'البحث عن كتاب...',
    allAuthors: locale === 'fr' ? 'Tous les auteurs' : locale === 'en' ? 'All authors' : 'جميع المؤلفين',
    results: locale === 'fr' ? 'résultats' : locale === 'en' ? 'results' : 'نتيجة',
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gray-50 py-20">
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={labels.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
            />
          </div>
          
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none bg-white min-w-[200px]"
          >
            <option value="">{labels.allAuthors}</option>
            {authors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedAuthor) && (
          <p className="text-sm text-gray-500 mb-6">
            {filteredBooks.length} {labels.results}
            {selectedAuthor && ` - ${selectedAuthor}`}
          </p>
        )}

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">
            {locale === 'fr' ? 'Aucun livre disponible pour le moment.' : 
             locale === 'en' ? 'No books available at the moment.' : 
             'لا توجد كتب متاحة حالياً.'}
          </p>
        )}
      </section>
    </div>
  );
}

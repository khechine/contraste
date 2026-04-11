


'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Author, Book } from '@/lib/types';
import { Locale, getLocalizedField, getBooksRoute } from '@/lib/i18n';
import { BookCard } from '@/components/Cards';
import { getImageUrl } from '@/lib/directus';
import Link from 'next/link';

interface AuthorDetailContentProps {
  author: Author;
  locale: Locale;
  authorBooks: Book[];
}

const labels = {
  fr: {
    backToAuthors: 'Retour aux auteurs',
    booksBy: 'Livres par',
    allBooks: 'Tous les livres',
    sortBy: 'Trier par',
    filterBy: 'Filtrer par',
    search: 'Rechercher',
    noBooks: 'Aucun livre trouvé',
    totalBooks: 'livres au total',
    categories: 'Catégories',
    years: 'Années de publication',

    priceRange: 'Fourchette de prix',
    recentFirst: "Plus récent d'abord",
    oldestFirst: "Plus ancien d'abord",
    priceLowHigh: 'Prix croissant',
    priceHighLow: "Prix décroissant",
    titleAZ: 'Titre A-Z',
    titleZA: 'Titre Z-A',
    allCategories: 'Toutes les catégories',
    allYears: 'Toutes les années',
    allPrices: 'Tous les prix',
    statistics: 'Statistiques',
    publishedBooks: 'Livres publiés',
    averagePrice: 'Prix moyen',
    publicationSpan: 'Période de publication',
    publicationTimeline: 'Chronologie de publication',
    clearFilters: 'Effacer les filtres',
  },
  en: {
    backToAuthors: 'Back to authors',
    booksBy: 'Books by',
    allBooks: 'All books',
    sortBy: 'Sort by',
    filterBy: 'Filter by',
    search: 'Search',
    noBooks: 'No books found',
    totalBooks: 'books total',
    categories: 'Categories',
    years: 'Publication years',
    priceRange: 'Price range',
    recentFirst: 'Recent first',
    oldestFirst: 'Oldest first',
    priceLowHigh: 'Price low to high',
    priceHighLow: 'Price high to low',
    titleAZ: 'Title A-Z',
    titleZA: 'Title Z-A',
    allCategories: 'All categories',
    allYears: 'All years',
    allPrices: 'All prices',
    statistics: 'Statistics',
    publishedBooks: 'Published books',
    averagePrice: 'Average price',
    publicationSpan: 'Publication span',
    publicationTimeline: 'Publication timeline',
    clearFilters: 'Clear filters',
  },
  ar: {
    backToAuthors: 'العودة إلى المؤلفين',
    booksBy: 'كتب بواسطة',
    allBooks: 'جميع الكتب',
    sortBy: 'ترتيب حسب',
    filterBy: 'تصفية حسب',
    search: 'البحث',
    noBooks: 'لم يتم العثور على كتب',
    totalBooks: 'كتب إجمالي',
    categories: 'الفئات',
    years: 'سنوات النشر',
    priceRange: 'نطاق السعر',
    recentFirst: 'الأحدث أولاً',
    oldestFirst: 'الأقدم أولاً',
    priceLowHigh: 'السعر من الأقل للأعلى',
    priceHighLow: 'السعر من الأعلى للأقل',
    titleAZ: 'العنوان أ-ي',
    titleZA: 'العنوان ي-أ',
    allCategories: 'جميع الفئات',
    allYears: 'جميع السنوات',
    allPrices: 'جميع الأسعار',
    statistics: 'الإحصائيات',
    publishedBooks: 'الكتب المنشورة',
    averagePrice: 'متوسط السعر',
    publicationSpan: 'فترة النشر',
    publicationTimeline: 'الجدول الزمني للنشر',
    clearFilters: 'مسح المرشحات',
  },
};

type SortOption = 'recent' | 'oldest' | 'price-low' | 'price-high' | 'title-az' | 'title-za';

export default function AuthorDetailContent({ author, locale, authorBooks }: AuthorDetailContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const bio = getLocalizedField(author, locale, 'bio', 'bio_en', 'bio_ar');
  const lbl = labels[locale];
  const photoUrl = getImageUrl(author.photo);
  const authorLinks = { fr: '/fr/auteurs', en: '/en/authors', ar: '/ar/authors' };

  // Calculate statistics
  const stats = useMemo(() => {
    if (authorBooks.length === 0) return null;

    const years = authorBooks
      .map(book => book.year)
      .filter(year => year)
      .sort((a, b) => (a || 0) - (b || 0));

    const categories = [...new Set(authorBooks.map(book => book.category).filter(Boolean))];
    const avgPrice = authorBooks.reduce((sum, book) => sum + (book.price_dt || 0), 0) / authorBooks.length;

    return {
      totalBooks: authorBooks.length,
      categories,
      years: years.length > 0 ? `${years[0]}-${years[years.length - 1]}` : null,
      avgPrice: Math.round(avgPrice * 100) / 100,
    };
  }, [authorBooks]);

  // Get unique categories and years for filters
  const categories = useMemo(() => {
    return [...new Set(authorBooks.map(book => book.category).filter(Boolean))].sort();
  }, [authorBooks]);

  const years = useMemo(() => {
    return [...new Set(authorBooks.map(book => book.year).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));
  }, [authorBooks]);

// Publication timeline data
  const publicationTimeline = useMemo(() => {
    const timeline = new Map<number, Book[]>();
    authorBooks.forEach(book => {
      if (book.year) {
        if (!timeline.has(book.year)) {
          timeline.set(book.year, []);
        }
        timeline.get(book.year)!.push(book);
      }
    });
    return Array.from(timeline.entries())
      .sort(([a], [b]) => b - a)
      .slice(0, 10); // Show last 10 years
  }, [authorBooks]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = authorBooks.filter(book => {
      const title = getLocalizedField(book, locale, 'title', 'title_en', 'title_ar').toLowerCase();
      const description = getLocalizedField(book, locale, 'description', 'description_en', 'description_ar').toLowerCase();

      const matchesSearch = searchTerm === '' ||
        title.includes(searchTerm.toLowerCase()) ||
        description.includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      const matchesYear = selectedYear === 'all' || book.year?.toString() === selectedYear;

      return matchesSearch && matchesCategory && matchesYear;
    });

    // Sort books
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (b.year || 0) - (a.year || 0);
        case 'oldest':
          return (a.year || 0) - (b.year || 0);
        case 'price-low':
          return (a.price_dt || 0) - (b.price_dt || 0);
        case 'price-high':
          return (b.price_dt || 0) - (a.price_dt || 0);
        case 'title-az':
          return getLocalizedField(a, locale, 'title', 'title_en', 'title_ar')
            .localeCompare(getLocalizedField(b, locale, 'title', 'title_en', 'title_ar'));
        case 'title-za':
          return getLocalizedField(b, locale, 'title', 'title_en', 'title_ar')
            .localeCompare(getLocalizedField(a, locale, 'title', 'title_en', 'title_ar'));
        default:
          return 0;
      }
    });

    return filtered;
  }, [authorBooks, searchTerm, selectedCategory, selectedYear, sortBy, locale]);

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href={authorLinks[locale]} className="text-sm text-gray-500 hover:text-black mb-8 inline-block">
          ← {lbl.backToAuthors}
        </Link>

        <div className="flex flex-col md:flex-row gap-12 mt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0"
          >
            <div className="relative w-48 h-48 mx-auto md:mx-0 rounded-full overflow-hidden bg-gray-100">
              {photoUrl ? (
                <Image src={photoUrl} alt={author.name} fill sizes="(max-width: 768px) 192px, 192px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-6">{author.name}</h1>
            <div 
              className="text-gray-700 leading-relaxed text-lg mb-8"
              dangerouslySetInnerHTML={{ __html: bio }}
            />

            {/* Statistics */}
            {stats && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">{lbl.statistics}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalBooks}</div>
                    <div className="text-sm text-gray-600">{lbl.publishedBooks}</div>
                  </div>
                  {stats.categories.length > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.categories.length}</div>
                      <div className="text-sm text-gray-600">{lbl.categories}</div>
                    </div>
                  )}
                  {stats.avgPrice > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.avgPrice} DT</div>
                      <div className="text-sm text-gray-600">{lbl.averagePrice}</div>
                    </div>
                  )}
                  {stats.years && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.years}</div>
                      <div className="text-sm text-gray-600">{lbl.publicationSpan}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Publication Timeline */}
            {publicationTimeline.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">{lbl.publicationTimeline}</h3>
              </div>
            )}

            {/* Books Section */}
            {authorBooks.length > 0 && (
              <div className="mt-16">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                  <h2 className="text-2xl font-serif font-bold mb-4 lg:mb-0">{lbl.booksBy} {author.name}</h2>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{lbl.search}</label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`${lbl.search}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{lbl.categories}</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">{lbl.allCategories}</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{lbl.years}</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">{lbl.allYears}</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{lbl.sortBy}</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="recent">{lbl.recentFirst}</option>
                        <option value="oldest">{lbl.oldestFirst}</option>
                        <option value="price-low">{lbl.priceLowHigh}</option>
                        <option value="price-high">{lbl.priceHighLow}</option>
                        <option value="title-az">{lbl.titleAZ}</option>
                        <option value="title-za">{lbl.titleZA}</option>
                      </select>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {filteredAndSortedBooks.length} {lbl.totalBooks}
                      {searchTerm && ` • ${lbl.search}: "${searchTerm}"`}
                      {selectedCategory !== 'all' && ` • ${lbl.categories}: ${selectedCategory}`}
                      {selectedYear !== 'all' && ` • ${lbl.years}: ${selectedYear}`}
                    </div>
                    {(searchTerm || selectedCategory !== 'all' || selectedYear !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setSelectedYear('all');
                          setSortBy('recent');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {lbl.clearFilters}
                      </button>
                    )}
                  </div>
                </div>

                {/* Books Display */}
                {filteredAndSortedBooks.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {filteredAndSortedBooks.map((book) => (
                        <Link key={book.id} href={`/${locale}/${getBooksRoute(locale)}/${book.slug}`}>
                          <BookCard book={book} locale={locale} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAndSortedBooks.map((book) => (
                        <div key={book.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <Link href={`/${locale}/${getBooksRoute(locale)}/${book.slug}`} className="flex gap-6">
                            <div className="flex-shrink-0">
                              <div className="relative w-20 h-28 bg-gray-100 rounded overflow-hidden">
                                {getImageUrl(book.cover_image) ? (
                                  <Image
                                    src={getImageUrl(book.cover_image)!}
                                    alt={getLocalizedField(book, locale, 'title', 'title_en', 'title_ar')}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {getLocalizedField(book, locale, 'title', 'title_en', 'title_ar')}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {getLocalizedField(book, locale, 'description', 'description_en', 'description_ar')}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                {book.year && <span className="text-sm text-gray-500">{book.year}</span>}
                                {book.category && <span className="text-sm bg-gray-100 px-2 py-1 rounded">{book.category}</span>}
                                <div className="flex gap-2">
                                  {book.price_dt && <span className="text-sm font-medium">{book.price_dt} DT</span>}
                                  {book.price_eur && <span className="text-sm text-gray-500">{book.price_eur} €</span>}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{lbl.noBooks}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || selectedCategory !== 'all' || selectedYear !== 'all'
                        ? 'Essayez de modifier vos filtres de recherche.'
                        : 'Aucun livre n"est disponible pour le moment.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

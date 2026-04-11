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
  const photoUrl = getImageUrl(author.photo || author.image);
  const authorLinks = { fr: '/fr/auteurs', en: '/en/authors', ar: '/ar/authors' };

  const stats = useMemo(() => {
    if (authorBooks.length === 0) return null;
    const years = authorBooks.map(book => book.year).filter(Boolean).sort((a, b) => (a || 0) - (b || 0));
    const categories = [...new Set(authorBooks.map(book => book.category).filter(Boolean))];
    const avgPrice = authorBooks.reduce((sum, book) => sum + (book.price_dt || 0), 0) / authorBooks.length;
    return {
      totalBooks: authorBooks.length,
      categories,
      years: years.length > 0 ? `${years[0]}-${years[years.length - 1]}` : null,
      avgPrice: Math.round(avgPrice * 100) / 100,
    };
  }, [authorBooks]);

  const categories = useMemo(() => [...new Set(authorBooks.map(book => book.category).filter(Boolean))].sort(), [authorBooks]);
  const years = useMemo(() => [...new Set(authorBooks.map(book => book.year).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0)), [authorBooks]);

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = authorBooks.filter(book => {
      const title = getLocalizedField(book, locale, 'title', 'title_en', 'title_ar').toLowerCase();
      const description = getLocalizedField(book, locale, 'description', 'description_en', 'description_ar').toLowerCase();
      const matchesSearch = searchTerm === '' || title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      const matchesYear = selectedYear === 'all' || book.year?.toString() === selectedYear;
      return matchesSearch && matchesCategory && matchesYear;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent': return (b.year || 0) - (a.year || 0);
        case 'oldest': return (a.year || 0) - (b.year || 0);
        case 'price-low': return (a.price_dt || 0) - (b.price_dt || 0);
        case 'price-high': return (b.price_dt || 0) - (a.price_dt || 0);
        case 'title-az': return getLocalizedField(a, locale, 'title', 'title_en', 'title_ar').localeCompare(getLocalizedField(b, locale, 'title', 'title_en', 'title_ar'));
        case 'title-za': return getLocalizedField(b, locale, 'title', 'title_en', 'title_ar').localeCompare(getLocalizedField(a, locale, 'title', 'title_en', 'title_ar'));
        default: return 0;
      }
    });

    return filtered;
  }, [authorBooks, searchTerm, selectedCategory, selectedYear, sortBy, locale]);

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <Link href={authorLinks[locale]} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-12 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          {lbl.backToAuthors}
        </Link>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-shrink-0">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto md:mx-0 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-slate-50 transition-transform duration-500 hover:scale-[1.02]">
              {photoUrl ? (
                <Image src={photoUrl} alt={author.name} fill sizes="(max-width: 768px) 256px, 256px" className="object-cover" unoptimized priority />
              ) : (
                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300 italic font-serif text-2xl">
                  {author.name.charAt(0)}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              {author.name}
            </h1>
            
            <div 
              className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed mb-12"
              dangerouslySetInnerHTML={{ __html: bio || '' }}
            />

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-slate-900">{stats.totalBooks}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{lbl.publishedBooks}</div>
                </div>
                {stats.categories.length > 0 && (
                  <div className="space-y-1 border-l sm:border-l-0 sm:pl-0 pl-4 border-slate-200">
                    <div className="text-3xl font-bold text-slate-900">{stats.categories.length}</div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{lbl.categories}</div>
                  </div>
                )}
                {stats.avgPrice > 0 && (
                  <div className="space-y-1 border-l border-slate-200 pl-4">
                    <div className="text-3xl font-bold text-slate-900">{stats.avgPrice} <span className="text-sm font-medium">DT</span></div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{lbl.averagePrice}</div>
                  </div>
                )}
                {stats.years && (
                  <div className="space-y-1 border-l border-slate-200 pl-4">
                    <div className="text-3xl font-bold text-slate-900">{stats.years.split('-')[0]}</div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{lbl.publicationSpan}</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Books Section */}
        {authorBooks.length > 0 && (
          <section className="mt-20 sm:mt-32">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                {lbl.booksBy} {author.name}
              </h2>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`${lbl.search}...`} className="px-5 py-3 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white transition-all shadow-sm" />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-5 py-3 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white transition-all shadow-sm">
                <option value="all">{lbl.allCategories}</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-5 py-3 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white transition-all shadow-sm">
                <option value="all">{lbl.allYears}</option>
                {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="px-5 py-3 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 bg-white transition-all shadow-sm">
                <option value="recent">{lbl.recentFirst}</option>
                <option value="oldest">{lbl.oldestFirst}</option>
                <option value="price-low">{lbl.priceLowHigh}</option>
                <option value="price-high">{lbl.priceHighLow}</option>
              </select>
            </div>

            {/* Display */}
            {filteredAndSortedBooks.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
                  {filteredAndSortedBooks.map((book) => (
                    <BookCard key={book.id} book={book} locale={locale} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredAndSortedBooks.map((book) => (
                    <Link key={book.id} href={`/${locale}/${getBooksRoute(locale)}/${book.slug}`} className="block group">
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 flex gap-4 sm:gap-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                        <div className="relative w-20 h-28 sm:w-32 sm:h-44 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                          <Image src={getImageUrl(book.cover_image)!} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {getLocalizedField(book, locale, 'title', 'title_en', 'title_ar')}
                          </h3>
                          <div 
                            className="text-sm sm:text-base text-slate-500 line-clamp-2 max-w-2xl mb-4"
                            dangerouslySetInnerHTML={{ __html: getLocalizedField(book, locale, 'description', 'description_en', 'description_ar') }}
                          />
                          <div className="flex items-center gap-4 text-xs sm:text-sm font-bold tracking-wider text-slate-400 uppercase">
                            <span>{book.year}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{book.category}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-slate-900">{book.price_dt} DT</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{lbl.noBooks}</h3>
                <p className="text-slate-500">{searchTerm ? 'Essayez de modifier vos filtres.' : 'Revenez bientôt !'}</p>
              </div>
            )}
          </section>
        )}
      </section>
    </div>
  );
}

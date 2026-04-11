'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

import Link from 'next/link';
import { BookCard, NewsCard } from './Cards';
import HeroSectionCard from './HeroSectionCard';
import LatestBookShowcase from './LatestBookShowcase';
import BooksCarouselHero from './BooksCarouselHero';
import { Locale, getLocalizedField, getBooksRoute, getAuthorsRoute, getNewsRoute } from '@/lib/i18n';
import { Book, HeroSection, News, Author } from '@/lib/types';
import { getImageUrl } from '@/lib/directus';

interface AnimatedHomeProps {
  heroes: HeroSection[];
  books: Book[];
  news: News[];
  latestBook: Book | null;
  authorOfMonth: Author | null;
  locale: Locale;
  labels: {
    featuredBooks: string;
    latestNews: string;
    viewAll: string;
    hero: string;
    heroSub: string;
    authorOfMonth: string;
    discoverAuthor: string;
  };
  bookLinks: string;
  newsLinks: string;
}

export default function AnimatedHome({
  heroes,
  books,
  news,
  latestBook,
  authorOfMonth,
  locale,
  labels,
  bookLinks,
  newsLinks,
}: AnimatedHomeProps) {
  const displayedHeroes = heroes.length > 0 ? heroes : [
    latestBook && {
      id: 999,
      title: getLocalizedField(latestBook as any, locale, 'title', 'title_en', 'title_ar') || 'Nouveau livre disponible',
      title_en: getLocalizedField(latestBook as any, locale, 'title', 'title_en', 'title_ar'),
      title_ar: getLocalizedField(latestBook as any, locale, 'title', 'title_en', 'title_ar'),
      subtitle: locale === 'fr' ? 'Découvrez notre dernière parution' : locale === 'en' ? 'Explore our latest release' : 'اكتشف أحدث إصدار لدينا',
      subtitle_en: locale === 'en' ? 'Explore our latest release' : locale === 'fr' ? 'Découvrez notre dernière parution' : 'اكتشف أحدث إصدار لدينا',
      subtitle_ar: locale === 'ar' ? 'اكتشف أحدث إصدار لدينا' : locale === 'fr' ? 'Découvrez notre dernière parution' : 'Explore our latest release',
      description: getLocalizedField(latestBook as any, locale, 'description', 'description_en', 'description_ar') || 'Un roman captivant pour enrichir votre bibliothèque.',
      description_en: getLocalizedField(latestBook as any, locale, 'description', 'description_en', 'description_ar') || '',
      description_ar: getLocalizedField(latestBook as any, locale, 'description', 'description_en', 'description_ar') || '',
      cta_label: locale === 'fr' ? 'Voir le livre' : locale === 'en' ? 'View book' : 'عرض الكتاب',
      cta_label_en: locale === 'en' ? 'View book' : locale === 'fr' ? 'Voir le livre' : 'عرض الكتاب',
      cta_label_ar: locale === 'ar' ? 'عرض الكتاب' : locale === 'fr' ? 'Voir le livre' : 'View book',
      cta_url: `/${locale}/${getBooksRoute(locale)}/${latestBook.slug}`,
      image: latestBook.cover_image || null,
      type: 'book',
      order: 0,
    } as HeroSection,
    news.length > 0 && {
      id: 1000,
      title: news[0].title || 'Dernières actualités',
      title_en: news[0].title || '',
      title_ar: news[0].title || '',
      subtitle: locale === 'fr' ? 'Ne manquez pas nos annonces et événements.' : locale === 'en' ? 'Stay up to date with our latest announcements.' : 'تابع أحدث الإعلانات لدينا.',
      subtitle_en: locale === 'en' ? 'Stay up to date with our latest announcements.' : locale === 'fr' ? 'Ne manquez pas nos annonces et événements.' : 'تابع أحدث الإعلانات لدينا.',
      subtitle_ar: locale === 'ar' ? 'تابع أحدث الإعلانات لدينا.' : locale === 'fr' ? 'Ne manquez pas nos annonces et événements.' : 'Stay up to date with our latest announcements.',
      description: getLocalizedField(news[0] as any, locale, 'content', 'content', 'content_ar') || 'Des contenus riches et des nouvelles de la maison d\'édition.',
      description_en: getLocalizedField(news[0] as any, locale, 'content', 'content', 'content_ar') || '',
      description_ar: getLocalizedField(news[0] as any, locale, 'content', 'content', 'content_ar') || '',
      cta_label: locale === 'fr' ? 'Voir les actualités' : locale === 'en' ? 'See news' : 'شاهد الأخبار',
      cta_label_en: locale === 'en' ? 'See news' : locale === 'fr' ? 'Voir les actualités' : 'شاهد الأخبار',
      cta_label_ar: locale === 'ar' ? 'شاهد الأخبار' : locale === 'fr' ? 'Voir les actualités' : 'See news',
      cta_url: newsLinks,
      image: news[0].image || null,
      type: 'news',
      order: 1,
    } as HeroSection,
  ].filter(Boolean) as HeroSection[];

  return (
    <div>
      {/* Books Carousel Hero */}
      <BooksCarouselHero books={books} locale={locale} bookLinks={bookLinks} />

      {/* Welcome Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative mx-auto mb-20 h-48 w-full max-w-[400px]">
              <Image 
                src="/logo-contraste-retina.svg" 
                alt="Contraste Éditions"
                fill
                sizes="(max-width: 1024px) 70vw, 400px"
                className="opacity-95 drop-shadow-2xl object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-8 mt-6 leading-tight">
              {labels.hero}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 leading-relaxed max-w-3xl mx-auto px-4">
              {labels.heroSub}
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/manuscrit`}
                className="inline-flex px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-full hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                {locale === 'fr' ? 'Envoyer votre manuscrit' : locale === 'en' ? 'Submit Manuscript' : 'إرسال المخطوطة'}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex px-8 py-4 border-2 border-slate-300 text-lg font-semibold rounded-full hover:bg-slate-50 transition-all duration-300 hover:shadow-md"
              >
                {locale === 'en' ? 'Contact Us' : locale === 'fr' ? 'Contactez-nous' : 'اتصل بنا'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Hero sections</p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-serif font-bold text-white">Découvrez nos nouveautés</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
              {locale === 'fr'
                ? 'Des projets éditoriaux, des annonces et des histoires qui méritent d’être vues.'
                : locale === 'en'
                ? 'Editorial projects, announcements, and stories worth seeing.'
                : 'مشاريع تحريرية وإعلانات وقصص تستحق المشاهدة.'}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {displayedHeroes
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((section) => (
                <HeroSectionCard key={section.id} section={section} locale={locale} />
              ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold">{labels.featuredBooks}</h2>
          <Link href={bookLinks} className="text-sm font-medium hover:underline">
            {labels.viewAll} →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} locale={locale} />
          ))}
        </div>
      </section>

      {latestBook && (
        <section className="bg-gradient-to-b from-slate-50 to-white py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                {locale === 'fr' ? 'Découvrez nos nouveautés' : locale === 'en' ? 'Discover our latest releases' : 'اكتشف أحدث إصداراتنا'}
              </h2>
              <p className="text-slate-600">
                {locale === 'fr'
                  ? 'Explorez notre dernière parution avec tous les détails.'
                  : locale === 'en'
                  ? 'Explore our latest release with all the details.'
                  : 'اكتشف آخر إصدار لدينا مع جميع التفاصيل.'}
              </p>
            </div>
            <LatestBookShowcase book={latestBook} locale={locale} bookLinks={bookLinks} />
          </div>
        </section>
      )}

      {/* Auteur du Mois */}
      {authorOfMonth && (
        <section className="bg-white py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-emerald-900">{labels.authorOfMonth}</h2>
              <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative h-80 md:h-auto bg-slate-200">
                  {getImageUrl(authorOfMonth.photo || authorOfMonth.image) ? (
                    <Image
                      src={getImageUrl(authorOfMonth.photo || authorOfMonth.image)!}
                      alt={authorOfMonth.name || "Photo de l'auteur"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="md:w-2/3 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                  <h3 className="text-3xl font-serif font-bold mb-6">{authorOfMonth.name}</h3>
                  <div 
                    className="text-lg text-slate-600 mb-8 line-clamp-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: getLocalizedField(authorOfMonth as any, locale, 'bio', 'bio_en', 'bio_ar') }}
                  />
                  <div>
                    <Link
                      href={`/${locale}/${getAuthorsRoute(locale)}/${authorOfMonth.slug}`}
                      className="inline-flex items-center px-6 py-3 bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      {labels.discoverAuthor} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-gray-50 py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold">{labels.latestNews}</h2>
            <Link href={newsLinks} className="text-sm font-medium hover:underline">
              {labels.viewAll} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from(new Map(news.map(item => [item.id, item])).values()).map((item) => (
              <Link key={item.id} href={`/${locale}/${getNewsRoute(locale)}/${item.slug}`}>
                <NewsCard news={item} locale={locale} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { getFeaturedBooks, getHeroSections, getLatestNews, getLatestBook, getAuthorOfTheMonth } from '@/lib/directus';
import { Locale } from '@/lib/i18n';
import AnimatedHome from '@/components/AnimatedHome';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ lang: string }>;
}

const pageTitles = {
  fr: {
    hero: 'Bienvenue chez Contraste Éditions',
    heroSub: 'Maison d\'édition indépendante dédiée à la littérature de qualité et culturelle.',
    featuredBooks: 'Livres en vedette',
    latestNews: 'Dernières actualités',
    viewAll: 'Voir tout',
    authorOfMonth: 'Auteur du mois',
    discoverAuthor: 'Découvrir',
  },
  en: {
    hero: 'Welcome to Contraste Éditions',
    heroSub: 'Independent publishing house dedicated to quality literature and culture.',
    featuredBooks: 'Featured Books',
    latestNews: 'Latest News',
    viewAll: 'View all',
    authorOfMonth: 'Author of the Month',
    discoverAuthor: 'Discover',
  },
  ar: {
    hero: 'مرحباً بكم في دار Contraste النشر',
    heroSub: 'دار نشر مستقلة مكرسة للأدب عالي الجودة.',
    featuredBooks: 'كتب مميزة',
    latestNews: 'آخر الأخبار',
    viewAll: 'عرض الكل',
    authorOfMonth: 'مؤلف الشهر',
    discoverAuthor: 'اكتشف',
  },
};

const bookLinks = { fr: '/fr/livres', en: '/en/books', ar: '/ar/books' };
const newsLinks = { fr: '/fr/actualites', en: '/en/news', ar: '/ar/news' };

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const titles = pageTitles[locale];
  
  const [heroes, books, news, latestBook, authorOfMonth] = await Promise.all([
    getHeroSections(),
    getFeaturedBooks(),
    getLatestNews(3),
    getLatestBook(),
    getAuthorOfTheMonth(),
  ]);

  return (
    <AnimatedHome
      heroes={heroes}
      books={books}
      news={news}
      latestBook={latestBook}
      authorOfMonth={authorOfMonth}
      locale={locale}
      labels={titles}
      bookLinks={bookLinks[locale]}
      newsLinks={newsLinks[locale]}
    />
  );
}

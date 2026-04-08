import { getBooks } from '@/lib/directus';
import { Locale } from '@/lib/i18n';
import AnimatedBooks from '@/components/AnimatedBooks';

interface PageProps {
  params: Promise<{ lang: string }>;
}

const pageTitles = {
  fr: { title: 'Nos Livres', subtitle: 'Explorez notre catalogue complet' },
  en: { title: 'Our Books', subtitle: 'Explore our complete catalog' },
  ar: { title: 'كتبنا', subtitle: 'استكشف كتالوجنا الكامل' },
};

export default async function BooksPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const titles = pageTitles[locale];
  const books = await getBooks();

  return (
    <AnimatedBooks
      books={books}
      locale={locale}
      titles={titles}
      bookLink={`/${locale}/books`}
    />
  );
}

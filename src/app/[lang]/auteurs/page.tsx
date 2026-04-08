import { getAuthors } from '@/lib/directus';
import { Locale } from '@/lib/i18n';
import AnimatedAuthors from '@/components/AnimatedAuthors';

interface PageProps {
  params: Promise<{ lang: string }>;
}

const pageTitles = {
  fr: { title: 'Nos Auteurs', subtitle: 'Rencontrez les voix qui façonnent notre collection' },
  en: { title: 'Our Authors', subtitle: 'Meet the voices shaping our collection' },
  ar: { title: 'المؤلفون', subtitle: 'التقى بالأصوات التي تصيغ مجموعتنا' },
};

export default async function AuthorsPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const titles = pageTitles[locale];
  const authors = await getAuthors();

  return (
    <AnimatedAuthors
      authors={authors}
      locale={locale}
      titles={titles}
    />
  );
}

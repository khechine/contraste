import { getNews } from '@/lib/directus';
import { Locale } from '@/lib/i18n';
import AnimatedNews from '@/components/AnimatedNews';

interface PageProps {
  params: Promise<{ lang: string }>;
}

const pageTitles = {
  fr: { title: 'Actualités', subtitle: 'Restez informé de nos dernières nouvelles' },
  en: { title: 'News', subtitle: 'Stay informed about our latest updates' },
  ar: { title: 'الأخبار', subtitle: 'ابق على اطلاع بآخر أخبارنا' },
};

export default async function NewsPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const titles = pageTitles[locale];
  const newsItems = await getNews();

  return (
    <AnimatedNews
      news={newsItems}
      locale={locale}
      titles={titles}
    />
  );
}

import { notFound } from 'next/navigation';
import Image from 'next/image';

import { getNewsItemBySlug, getImageUrl } from '@/lib/directus';
import { Locale, getLocalizedField } from '@/lib/i18n';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

const labels = {
  fr: { backToNews: 'Retour aux actualités' },
  en: { backToNews: 'Back to news' },
  ar: { backToNews: 'العودة إلى الأخبار' },
};

export async function generateMetadata({ params }: PageProps) {
  const { lang, id } = await params;
  const locale = lang as Locale;
  const news = await getNewsItemBySlug(id);
  
  if (!news) return { title: 'News not found' };
  
  const title = getLocalizedField(news, locale, 'title', 'title_en', 'title_ar');
  return { title: `${title} | Contraste Éditions` };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { lang, id } = await params;
  const locale = lang as Locale;
  const news = await getNewsItemBySlug(id);
  
  if (!news) notFound();

  const title = getLocalizedField(news, locale, 'title', 'title_en', 'title_ar');
  const content = getLocalizedField(news, locale, 'content', 'content_en', 'content_ar');
  const lbl = labels[locale];
  const imageUrl = getImageUrl(news.image);
  const date = news.date ? new Date(news.date).toLocaleDateString(locale === 'ar' ? 'ar-TN' : locale) : '';
  const newsLinks = { fr: '/fr/actualites', en: '/en/news', ar: '/ar/news' };

  return (
    <div className="min-h-screen">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href={newsLinks[locale]} className="text-sm text-gray-500 hover:text-black mb-8 inline-block">
          ← {lbl.backToNews}
        </Link>

        <article>
          {imageUrl && (
            <div className="relative aspect-video w-full mb-8 bg-gray-100 rounded-lg overflow-hidden">
              <Image src={imageUrl} alt={title} fill sizes="100vw" className="object-cover" />

            </div>
          )}

          {date && <p className="text-sm text-gray-500 mb-4">{date}</p>}

          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-8">{title}</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        </article>
      </section>
    </div>
  );
}

import { Suspense } from 'react';
import { getPressItems } from '@/lib/directus';
import { Locale } from '@/lib/i18n';
import PressCard from '@/components/PressCard';
import PressSkeleton from '@/components/PressSkeleton';
import { Metadata } from 'next';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ lang: string }>;
}

const translations = {
  fr: {
    title: 'Espace Presse',
    description: 'Découvrez ce que les médias disent de Contraste Éditions. Articles, interviews et critiques littéraires.',
    featured: 'À la une',
    allPress: 'Toute la presse',
    empty: 'Aucun article de presse pour le moment.'
  },
  en: {
    title: 'Press Room',
    description: 'Discover what the media says about Contraste Éditions. Articles, interviews, and literary reviews.',
    featured: 'Featured',
    allPress: 'Latest Coverage',
    empty: 'No press items available at the moment.'
  },
  ar: {
    title: 'فضاء الصحافة',
    description: 'اكتشف ما تقوله وسائل الإعلام عن منشورات كونتراست. مقالات ومقابلات ومراجعات أدبية.',
    featured: 'في الواجهة',
    allPress: 'كل الصحافة',
    empty: 'لا توجد مقالات صحفية في الوقت الحالي.'
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as Locale;
  const t = translations[locale] || translations.fr;

  return {
    title: `${t.title} | Contraste Éditions`,
    description: t.description,
    openGraph: {
      title: t.title,
      description: t.description,
      type: 'website',
    }
  };
}

async function PressList({ locale }: { locale: Locale }) {
  const allItems = await getPressItems();
  const t = translations[locale] || translations.fr;

  if (!allItems || allItems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{t.empty}</p>
      </div>
    );
  }

  const featuredItems = allItems.filter(item => item.featured);
  const regularItems = allItems.filter(item => !item.featured);

  return (
    <div className="space-y-16">
      {featuredItems.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-8 border-b border-gray-100 pb-4">
            {t.featured}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredItems.map((item) => (
              <PressCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-8 border-b border-gray-100 pb-4">
          {t.allPress}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularItems.map((item) => (
            <PressCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default async function PressPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const t = translations[locale] || translations.fr;

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <header className="mb-16 text-center md:text-left max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
          {t.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
          {t.description}
        </p>
      </header>

      <Suspense fallback={<PressSkeleton />}>
        <PressList locale={locale} />
      </Suspense>
    </main>
  );
}

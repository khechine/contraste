'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSection } from '@/lib/types';
import { Locale, getLocalizedField } from '@/lib/i18n';
import { getImageUrl } from '@/lib/directus';
import dynamic from 'next/dynamic';

interface HeroSectionCardProps {
  section: HeroSection;
  locale: Locale;
}

const AuthorOfMonthCardDynamic = dynamic(() => import('./AuthorOfMonthCard'), { ssr: false });

export default function HeroSectionCard({ section, locale }: HeroSectionCardProps) {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const title = getLocalizedField(section, locale, 'title', 'title_en', 'title_ar') || section.title;
  const subtitle = getLocalizedField(section, locale, 'subtitle', 'subtitle_en', 'subtitle_ar') || section.subtitle;
  const description = getLocalizedField(section, locale, 'description', 'description_en', 'description_ar') || section.description;
  const staticImageUrl = getImageUrl(section.image);

  if (section.type === 'author-month' && section.author_of_month) {
    return <AuthorOfMonthCardDynamic author={section.author_of_month} locale={locale} />;
  }

  // Generate image if not available
  useEffect(() => {
    if (staticImageUrl || isGenerating) return;

    const generateImage = async () => {
      setIsGenerating(true);
      try {
        // Use local placeholder instead of API call
        setGeneratedImageUrl(Math.random() > 0.5 ? '/images/books-with-colorful-covers-arrangement.jpg' : '/images/unrecognizable-woman-reading-book-from-stack.jpg');

      } finally {
        setIsGenerating(false);
      }
    };


    generateImage();
  }, [staticImageUrl, title, description, isGenerating, section.type]);

  const imageUrl = staticImageUrl || generatedImageUrl;
  const ctaLabel = getLocalizedField(section, locale, 'cta_label', 'cta_label_en', 'cta_label_ar') || section.cta_label || (locale === 'fr' ? 'En savoir plus' : locale === 'en' ? 'Learn more' : 'المزيد');
  const ctaUrl = section.cta_url || '#';

  return (
    <article className="group rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-white transition-transform hover:-translate-y-1">
      <div className="relative h-72 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || "Image de la section hero"}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-80"
            style={{ backgroundImage: 'linear-gradient(to bottom right, #0f172a, #334155, #0f172a)' }}
          >
            {isGenerating && (
              <div className="text-white text-center">
                <div className="animate-spin mb-2">⚙️</div>
                <p className="text-sm">{locale === 'fr' ? 'Génération...' : locale === 'en' ? 'Generating...' : 'جاري الإنشاء...'}</p>
              </div>
            )}
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{section.type || 'Hero'}</p>
          <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-slate-600 leading-7 mb-5">{subtitle}</p>
        <p className="text-sm text-slate-500 line-clamp-3 mb-6">{description}</p>
        <Link
          href={ctaUrl}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

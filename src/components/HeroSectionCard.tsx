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

  useEffect(() => {
    if (staticImageUrl || isGenerating) return;
    setGeneratedImageUrl(Math.random() > 0.5 ? '/images/books-with-colorful-covers-arrangement.jpg' : '/images/unrecognizable-woman-reading-book-from-stack.jpg');
  }, [staticImageUrl, isGenerating]);

  const imageUrl = staticImageUrl || generatedImageUrl;
  const ctaLabel = getLocalizedField(section, locale, 'cta_label', 'cta_label_en', 'cta_label_ar') || section.cta_label || (locale === 'fr' ? 'En savoir plus' : locale === 'en' ? 'Learn more' : 'المزيد');
  const ctaUrl = section.cta_url || '#';

  return (
    <article className="group rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-white transition-all transform hover:-translate-y-1">
      <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || "Hero image"}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300 font-bold mb-1 opacity-90">{section.type || 'Hero'}</p>
          <h3 className="text-xl sm:text-2xl font-serif font-bold leading-tight">{title}</h3>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        {subtitle && (
          <div 
            className="text-sm font-medium text-slate-800 mb-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}
        <div 
          className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed italic"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <Link
          href={ctaUrl}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors active:scale-95"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

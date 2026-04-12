'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Press } from '@/lib/types';
import { Locale } from '@/lib/i18n';
import { getImageUrl } from '@/lib/directus';

interface PressCardProps {
  item: Press;
  locale: Locale;
}

export default function PressCard({ item, locale }: PressCardProps) {
  const logoUrl = getImageUrl(item.logo);
  const attachmentUrl = getImageUrl(item.file_attachment);
  const date = item.publication_date 
    ? new Date(item.publication_date).toLocaleDateString(locale === 'ar' ? 'ar-TN' : 'fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const isPdf = typeof item.file_attachment === 'object' && item.file_attachment?.filename_disk?.endsWith('.pdf') || 
                (typeof item.file_attachment === 'string' && item.file_attachment.endsWith('.pdf'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full ${item.featured ? 'md:col-span-2 border-primary/20' : ''}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="relative h-12 w-32 grayscale group-hover:grayscale-0 transition-all duration-300">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={item.media_name}
              fill
              className="object-contain object-left"
              unoptimized
            />
          ) : (
            <span className="font-bold text-gray-400 text-lg">{item.media_name}</span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">{item.media_name}</p>
          <p className="text-[11px] text-gray-400 mt-1">{date}</p>
        </div>
      </div>

      <h3 className={`font-serif font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight ${item.featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
        {item.title}
      </h3>

      <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
        {item.excerpt}
      </p>

      <div className="flex flex-wrap items-center gap-4 mt-auto pt-4 border-t border-gray-50">
        {item.article_url && (
          <a
            href={item.article_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-primary transition-colors"
          >
            Lire l'article
            <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        )}

        {attachmentUrl && (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            {isPdf ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF Journal
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Voir Image
              </>
            )}
          </a>
        )}
      </div>
    </motion.div>
  );
}

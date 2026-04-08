import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { CONTRASTE_CONFIG } from '@/lib/contraste-config';

interface FooterProps {
  locale: Locale;
}

const footerLinks = {
  fr: {
    books: { label: 'Livres', href: '/fr/livres' },
    authors: { label: 'Auteurs', href: '/fr/auteurs' },
    news: { label: 'Actualités', href: '/fr/actualites' },
    contact: { label: 'Contact', href: '/fr/contact' },
  },
  en: {
    books: { label: 'Books', href: '/en/books' },
    authors: { label: 'Authors', href: '/en/authors' },
    news: { label: 'News', href: '/en/news' },
    contact: { label: 'Contact', href: '/en/contact' },
  },
  ar: {
    books: { label: 'الكتب', href: '/ar/books' },
    authors: { label: 'المؤلفون', href: '/ar/authors' },
    news: { label: 'الأخبار', href: '/ar/news' },
    contact: { label: 'اتصل بنا', href: '/ar/contact' },
  },
};

export default function Footer({ locale }: FooterProps) {
  const links = footerLinks[locale];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-serif font-bold tracking-tight mb-4">
              Contraste Éditions
            </h3>
            <p className="text-gray-600 text-sm max-w-md">
              {locale === 'fr' && 'Maison d\'édition indépendante dédiée à la littérature de qualité et culturelle.'}
              {locale === 'en' && 'Independent publishing house dedicated to quality literature.'}
              {locale === 'ar' && 'دار نشر مستقلة مكرسة للأدب عالي الجودة.'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {locale === 'fr' ? 'Navigation' : locale === 'en' ? 'Navigation' : 'التنقل'}
            </h4>
            <ul className="space-y-2">
              <li><Link href={links.books.href} className="text-sm text-gray-600 hover:text-black">{links.books.label}</Link></li>
              <li><Link href={links.authors.href} className="text-sm text-gray-600 hover:text-black">{links.authors.label}</Link></li>
              <li><Link href={links.news.href} className="text-sm text-gray-600 hover:text-black">{links.news.label}</Link></li>
              <li><Link href={links.contact.href} className="text-sm text-gray-600 hover:text-black">{links.contact.label}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {locale === 'fr' ? 'Contact' : locale === 'en' ? 'Contact' : 'اتصل بنا'}
            </h4>
            <div className="space-y-1">
              <p className="text-sm">
                <a href={`mailto:${CONTRASTE_CONFIG.contact.email}`} className="font-medium hover:underline">{CONTRASTE_CONFIG.contact.email}</a>
              </p>
              <p className="text-sm">{CONTRASTE_CONFIG.contact.phone}</p>
              <p className="text-sm">{CONTRASTE_CONFIG.contact.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            &copy; {year} {CONTRASTE_CONFIG.organization.name}. {locale === 'fr' ? 'Tous droits réservés.' : locale === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

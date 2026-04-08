import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, isValidLocale, getDirection, Locale } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = isValidLocale(lang) ? lang : 'fr';
  
  const titles = {
    fr: 'Contraste Éditions',
    en: 'Contraste Publishing',
    ar: 'دار النشر Contraste',
  };

  return {
    title: titles[locale as Locale],
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { lang } = await params;
  
  if (!isValidLocale(lang)) {
    notFound();
  }

  const locale = lang as Locale;
  const direction = getDirection(locale);

  return (
    <div lang={lang} dir={direction} className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
      <Navbar locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}

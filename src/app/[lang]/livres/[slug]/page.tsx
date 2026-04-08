import { notFound } from 'next/navigation';
import { getBook, getBookBySlug, getBooks, getAuthors } from '@/lib/directus';
import { Locale, getLocalizedField } from '@/lib/i18n';
import BookDetailContent from '@/components/BookDetailContent';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

const labels = {
  fr: {
    by: 'par',
    price: 'Prix',
    publicationDate: 'Date de publication',
    backToBooks: 'Retour aux livres',
    relatedAuthor: 'Auteur',
    otherBooksBy: 'Autres livres de',
    similarBooks: 'Livres similaires',
    cta_order: 'Commander ce livre',
  },
  en: {
    by: 'by',
    price: 'Price',
    publicationDate: 'Publication date',
    backToBooks: 'Back to books',
    relatedAuthor: 'Author',
    otherBooksBy: 'Other books by',
    similarBooks: 'Similar books',
    cta_order: 'Order Now',
  },
  ar: {
    by: 'بواسطة',
    price: 'السعر',
    publicationDate: 'تاريخ النشر',
    backToBooks: 'العودة إلى الكتب',
    relatedAuthor: 'المؤلف',
    otherBooksBy: 'كتب أخرى لـ',
    similarBooks: 'كتب مشابهة',
    cta_order: 'اطلب الآن',
  },
};

async function resolveBook(param: string) {
  const numericId = Number(param);
  if (!Number.isNaN(numericId) && param.trim() !== '') {
    const bookById = await getBook(numericId);
    if (bookById) return bookById;
  }
  return getBookBySlug(param);
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const book = await resolveBook(slug);
  
  if (!book) return { title: 'Book not found' };
  
  const title = getLocalizedField(book, locale, 'title', 'title_en', 'title_ar');
  return {
    title: `${title} | Contraste Éditions`,
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const book = await resolveBook(slug);
  
  if (!book) notFound();

  // Get related content
  const allBooks = await getBooks();
  const allAuthors = await getAuthors();

  // Books by the same author (try by ID first, then by name)
  const getAuthorName = (b: typeof allBooks[0]) => {
    if (typeof b.author === 'object' && b.author?.name) return b.author.name;
    return b.author_name || '';
  };
  const currentAuthorName = typeof book.author === 'object' && book.author?.name 
    ? book.author.name 
    : book.author_name || '';

  const authorBooks = allBooks.filter((b) => {
    if (b.id === book.id) return false;
    // Try matching by author_id first
    if (book.author_id && b.author_id === book.author_id) return true;
    // Fallback to author name matching
    return currentAuthorName && getAuthorName(b) === currentAuthorName;
  }).slice(0, 4);

  // Related books (same category, excluding current book and author's other books)
  const relatedBooks = allBooks.filter(
    (b) => b.id !== book.id && 
          b.category === book.category && 
          b.author_id !== book.author_id
  ).slice(0, 4);

  return (
    <BookDetailContent 
      book={book} 
      locale={locale} 
      authorBooks={authorBooks} 
      relatedBooks={relatedBooks}
      labels={labels}
      allBooks={allBooks}
    />
  );
}

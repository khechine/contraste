import { notFound } from 'next/navigation';
import { getAuthor, getAuthorBySlug, getBooks, getImageUrl } from '@/lib/directus';
import { Locale } from '@/lib/i18n';
import { Book } from '@/lib/types';
import AuthorDetailContent from '@/components/AuthorDetailContent';

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

const labels = {
  fr: {
    backToAuthors: 'Retour aux auteurs',
    booksBy: 'Livres par',
  },
  en: {
    backToAuthors: 'Back to authors',
    booksBy: 'Books by',
  },
  ar: {
    backToAuthors: 'العودة إلى المؤلفين',
    booksBy: 'كتب بواسطة',
  },
};

async function resolveAuthor(param: string) {
  const numericId = Number(param);
  if (!Number.isNaN(numericId) && param.trim() !== '') {
    const authorById = await getAuthor(numericId);
    if (authorById) return authorById;
  }
  return getAuthorBySlug(param);
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, id } = await params;
  const author = await resolveAuthor(id);
  if (!author) return { title: 'Author not found' };
  return { title: `${author.name} | Contraste Éditions` };
}

export default async function AuthorDetailPage({ params }: PageProps) {
  const { lang, id } = await params;
  const locale = lang as Locale;
  const author = await resolveAuthor(id);
  
  if (!author) notFound();

  const allBooks = await getBooks();
  const authorBooks = allBooks.filter(
    (book) => {
      // Check if book has author object with matching ID
      if (book.author && typeof book.author === 'object' && (book.author as any).id === author.id) {
        return true;
      }
      // Check if book has author_name string matching author name
      if (book.author_name === author.name) {
        return true;
      }
      return false;
    }
  );

  return <AuthorDetailContent author={author} locale={locale} authorBooks={authorBooks} />;
}

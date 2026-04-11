import { Book } from './types';
import { fetchAPI } from './directus';


export async function getBooksByAuthor(authorId: number, limit = 3): Promise<Book[]> {
  const books = await fetchAPI<Book[]>(`books?filter[author_id][_eq]=${authorId}&limit=${limit}&sort=-date_created&fields=id,title,title_en,title_ar,slug,cover_image,cover_image.*,price_dt,price_eur,author_name,description,description_en,description_ar,author.*`);
  
  if (books.length > 0) return books;
  
  // Fallback to seed data
  const seedData = await import('./seed-data.json');
  const seedBooks = seedData.default.books
    .map((book: any, index: number) => ({
      id: 1000 + index,
      title: book.title,
      title_en: book.title_en || book.title,
      title_ar: book.title_ar || book.title,
      slug: book.slug || slugify(book.title),
      author_id: authorId,
      author_name: book.author_name,
      description: book.description,
      description_en: book.description_en || book.description,
      description_ar: book.description_ar || book.description,
      cover_image: book.cover || null,
      price_dt: book.price_dt,
      price_eur: book.price_eur,
      isbn: book.isbn,
      pages: book.pages,
      year: book.year,
      language: book.language,
      category: book.category,
    }))
    .filter((book: Book) => book.author_name === seedData.default.authors[authorId - 1000]?.name || book.author_name.includes(seedData.default.authors[authorId - 1000]?.name || ''))
    .slice(0, limit) as Book[];
  
  return seedBooks;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}


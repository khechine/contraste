import seedData from './seed-data.json' with { type: 'json' };
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Charge les variables de .env.local si disponible
dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const args = process.argv.slice(2);
const tokenArg = args.find(arg => arg.startsWith('--token='));
const TOKEN = tokenArg ? tokenArg.split('=')[1] : process.env.DIRECTUS_TOKEN;

interface AuthorInput {
  name: string;
  bio_fr: string;
  bio_en: string;
  bio_ar: string;
  photo?: string | null;
}

interface BookInput {
  title?: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  price_dt: number;
  price_eur: number;
  author_name: string;
  cover?: string;
  isbn?: string;
  pages?: number;
  year?: number;
  language?: string;
  category?: string;
}

interface NewsInput {
  title: string;
  title_ar?: string;
  content: string;
  content_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  date: string;
  image?: string | null;
}

interface HeroSectionInput {
  title: string;
  title_en?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  description?: string;
  description_en?: string;
  description_ar?: string;
  cta_label?: string;
  cta_label_en?: string;
  cta_label_ar?: string;
  cta_url?: string;
  image?: string | null;
  type?: string;
  order?: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uploadImage(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  
  try {
    let blob: Blob;
    let filename: string;

    if (url.startsWith('/')) {
      // Cas d'un fichier local (ex: /images/seed/...)
      // On cherche dans le dossier 'public' à la racine du projet
      const filePath = path.join(process.cwd(), 'public', url);
      if (!fs.existsSync(filePath)) {
        console.error(`Local image not found: ${filePath}`);
        return null;
      }
      const buffer = fs.readFileSync(filePath);
      blob = new Blob([buffer]);
      filename = path.basename(filePath);
    } else {
      // Cas d'une URL distante
      const response = await fetch(url);
      if (!response.ok) return null;
      blob = await response.blob();
      filename = url.split('/').pop() || 'image.jpg';
    }

    const formData = new FormData();
    formData.append('file', blob, filename);
    
    const uploadResponse = await fetch(`${BASE_URL}/files`, {
      method: 'POST',
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      body: formData,
    });
    
    if (uploadResponse.ok) {
      const data = await uploadResponse.json();
      return data.data.id;
    } else {
      const error = await uploadResponse.text();
      console.error(`Failed to upload ${filename}:`, error);
    }
  } catch (error) {
    console.error('Failed to upload image:', error);
  }
  return null;
}

async function directusAdminFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  };

  return fetch(`${BASE_URL}/_/${endpoint}`, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers as Record<string, string>),
    },
  });
}

async function directusAdminRequest(endpoint: string, init?: RequestInit): Promise<any> {
  const response = await directusAdminFetch(endpoint, init);
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Directus admin request failed: ${response.status} ${text}`);
  }

  return json?.data ?? json;
}

async function ensureCollection(collection: string): Promise<void> {
  const response = await directusAdminFetch(`collections/${collection}`);
  if (response.ok) return;
  if (response.status !== 404) {
    throw new Error(`Failed to check collection ${collection}: ${response.status}`);
  }

  await directusAdminRequest('collections', {
    method: 'POST',
    body: JSON.stringify({
      collection,
      meta: { note: 'Hero sections for the homepage' },
      hidden: false,
      singleton: false,
    }),
  });
}

async function ensureField(collection: string, field: string, body: Record<string, unknown>): Promise<void> {
  const response = await directusAdminFetch(`fields/${collection}/${field}`);
  if (response.ok) return;
  if (response.status !== 404) {
    throw new Error(`Failed to check field ${collection}.${field}: ${response.status}`);
  }

  await directusAdminRequest(`fields/${collection}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function ensureHeroSectionsCollection(): Promise<void> {
  await ensureCollection('hero_sections');

  await ensureField('hero_sections', 'title', {
    field: 'title',
    type: 'string',
    schema: { max_length: 255, null: false },
    meta: { display_name: 'Title' },
  });
  await ensureField('hero_sections', 'title_en', {
    field: 'title_en',
    type: 'string',
    schema: { max_length: 255, null: true },
    meta: { display_name: 'Title (EN)' },
  });
  await ensureField('hero_sections', 'title_ar', {
    field: 'title_ar',
    type: 'string',
    schema: { max_length: 255, null: true },
    meta: { display_name: 'Title (AR)' },
  });
  await ensureField('hero_sections', 'subtitle', {
    field: 'subtitle',
    type: 'text',
    schema: { null: true },
    meta: { display_name: 'Subtitle' },
  });
  await ensureField('hero_sections', 'subtitle_en', {
    field: 'subtitle_en',
    type: 'text',
    schema: { null: true },
    meta: { display_name: 'Subtitle (EN)' },
  });
  await ensureField('hero_sections', 'subtitle_ar', {
    field: 'subtitle_ar',
    type: 'text',
    schema: { null: true },
    meta: { display_name: 'Subtitle (AR)' },
  });
  await ensureField('hero_sections', 'description', {
    field: 'description',
    type: 'text',
    schema: { null: true },
    meta: { display_name: 'Description' },
  });
  await ensureField('hero_sections', 'description_en', {
    field: 'description_en',
    type: 'text',
    schema: { null: true },
    meta: { display_name: 'Description (EN)' },
  });
  await ensureField('hero_sections', 'description_ar', {
    field: 'description_ar',
    type: 'text',
    schema: { null: true },
    meta: { display_name: 'Description (AR)' },
  });
  await ensureField('hero_sections', 'cta_label', {
    field: 'cta_label',
    type: 'string',
    schema: { max_length: 255, null: true },
    meta: { display_name: 'CTA Label' },
  });
  await ensureField('hero_sections', 'cta_label_en', {
    field: 'cta_label_en',
    type: 'string',
    schema: { max_length: 255, null: true },
    meta: { display_name: 'CTA Label (EN)' },
  });
  await ensureField('hero_sections', 'cta_label_ar', {
    field: 'cta_label_ar',
    type: 'string',
    schema: { max_length: 255, null: true },
    meta: { display_name: 'CTA Label (AR)' },
  });
  await ensureField('hero_sections', 'cta_url', {
    field: 'cta_url',
    type: 'string',
    schema: { max_length: 255, null: true },
    meta: { display_name: 'CTA URL' },
  });
  await ensureField('hero_sections', 'image', {
    field: 'image',
    type: 'string',
    schema: { max_length: 255, null: true },
    meta: { display_name: 'Hero Image URL' },
  });
  await ensureField('hero_sections', 'type', {
    field: 'type',
    type: 'string',
    schema: { max_length: 50, null: true },
    meta: { display_name: 'Type' },
  });
  await ensureField('hero_sections', 'order', {
    field: 'order',
    type: 'integer',
    schema: { null: true },
    meta: { display_name: 'Order' },
  });
}

async function createAuthor(author: AuthorInput): Promise<number | null> {
  try {
    const image_id = author.photo ? await uploadImage(author.photo) : null;
    
    const response = await fetch(`${BASE_URL}/items/authors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      body: JSON.stringify({
        name: author.name,
        slug: slugify(author.name),
        bio: author.bio_fr,
        bio_ar: author.bio_ar,
        photo: image_id,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Created author: ${author.name}`);
      return data.data.id;
    } else {
      const error = await response.text();
      console.error(`✗ Failed to create author ${author.name}:`, error);
    }
  } catch (error) {
    console.error(`✗ Error creating author ${author.name}:`, error);
  }
  return null;
}

async function createBook(book: BookInput, authorId: number): Promise<number | null> {
  try {
    const cover_id = book.cover ? await uploadImage(book.cover) : null;
    
    const response = await fetch(`${BASE_URL}/items/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      body: JSON.stringify({
        title: book.title || 'Untitled',
        slug: slugify(book.title || 'untitled'),
        author_id: authorId,
        author_name: book.author_name,
        description: book.description || 'No description available',
        description_ar: book.description_ar,
        cover_image: cover_id,
        price_dt: book.price_dt,
        price_eur: book.price_eur,
        isbn: book.isbn,
        pages: book.pages,
        year: book.year,
        language: book.language,
        category: book.category,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Created book: ${book.title}`);
      return data.data.id;
    } else {
      const error = await response.text();
      console.error(`✗ Failed to create book ${book.title}:`, error);
    }
  } catch (error) {
    console.error(`✗ Error creating book ${book.title}:`, error);
  }
  return null;
}

async function createNews(newsItem: NewsInput): Promise<number | null> {
  try {
    const image_id = newsItem.image ? await uploadImage(newsItem.image) : null;
    
    const response = await fetch(`${BASE_URL}/items/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      body: JSON.stringify({
        title: newsItem.title,
        slug: slugify(newsItem.title),
        content: newsItem.content,
        content_ar: newsItem.content_ar,
        excerpt: newsItem.excerpt,
        excerpt_ar: newsItem.excerpt_ar,
        date: newsItem.date,
        image: image_id,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Created news: ${newsItem.title}`);
      return data.data.id;
    } else {
      const error = await response.text();
      console.error(`✗ Failed to create news ${newsItem.title}:`, error);
    }
  } catch (error) {
    console.error(`✗ Error creating news ${newsItem.title}:`, error);
  }
  return null;
}

async function createHeroSection(hero: HeroSectionInput): Promise<number | null> {
  try {
    const response = await fetch(`${BASE_URL}/items/hero_sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      body: JSON.stringify({
        ...hero,
        order: hero.order ?? 0,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Created hero section: ${hero.title}`);
      return data.data.id;
    }

    const error = await response.text();
    console.error(`✗ Failed to create hero section ${hero.title}:`, error);
  } catch (error) {
    console.error(`✗ Error creating hero section ${hero.title}:`, error);
  }
  return null;
}

export async function seedDatabase() {
  console.log('🚀 Starting database seed...\n');
  console.log(`📡 Directus URL: ${BASE_URL}\n`);
  
  const authorMap = new Map<string, number>();
  
  console.log('═══════════════════════════════════════════');
  console.log('📚 Creating Authors...');
  console.log('═══════════════════════════════════════════');
  
  for (const author of seedData.authors) {
    const id = await createAuthor(author);
    if (id) {
      authorMap.set(author.name, id);
    }
  }
  
  console.log(`\n✓ Created ${authorMap.size} authors\n`);
  
  console.log('═══════════════════════════════════════════');
  console.log('📖 Creating Books...');
  console.log('═══════════════════════════════════════════');
  
  let booksCreated = 0;
  for (const book of seedData.books) {
    const authorId = authorMap.get(book.author_name);
    if (authorId) {
      const result = await createBook(book, authorId);
      if (result) booksCreated++;
    } else {
      console.error(`✗ Author not found: ${book.author_name}`);
    }
  }
  
  console.log(`\n✓ Created ${booksCreated} books\n`);
  
  console.log('═══════════════════════════════════════════');
  console.log('📰 Creating News...');
  console.log('═══════════════════════════════════════════');
  
  let newsCreated = 0;
  for (const newsItem of seedData.news) {
    const result = await createNews(newsItem);
    if (result) newsCreated++;
  }
  
  console.log(`\n✓ Created ${newsCreated} news items\n`);
  
  console.log('═══════════════════════════════════════════');
  console.log('🏠 Ensuring hero_sections collection...');
  console.log('═══════════════════════════════════════════');
  try {
    await ensureHeroSectionsCollection();
    console.log('✓ hero_sections collection is ready');
  } catch (error) {
    console.error('✗ Failed to ensure hero_sections collection:', error);
  }
  
  console.log('═══════════════════════════════════════════');
  console.log('🎯 Creating Hero Sections...');
  console.log('═══════════════════════════════════════════');
  
  let heroesCreated = 0;
  for (const hero of seedData.hero_sections || []) {
    const result = await createHeroSection(hero as HeroSectionInput);
    if (result) heroesCreated++;
  }
  
  console.log(`\n✓ Created ${heroesCreated} hero sections\n`);
  
  console.log('═══════════════════════════════════════════');
  console.log('✨ Seed Complete!');
  console.log('═══════════════════════════════════════════');
  console.log(`   Authors: ${authorMap.size}`);
  console.log(`   Hero sections: ${heroesCreated}`);
  console.log(`   Books: ${booksCreated}`);
  console.log(`   News: ${newsCreated}`);
  console.log('═══════════════════════════════════════════\n');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Done! ✓');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

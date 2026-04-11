import seedData from './src/lib/seed-data.json' with { type: 'json' };

const BASE_URL = 'http://localhost:8055';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM1MjcxM2QxLWU3MmUtNDA5OS05NmMyLTk2NmZiYTU5NmYzMCIsInJvbGUiOiIzMGFlNmIyNS0xN2RmLTRiM2YtYTlhYy04NWJiNDVjZmM0OWQiLCJhcHBfYWNjZXNzIjp0cnVlLCJhZG1pbl9hY2Nlc3MiOnRydWUsImlhdCI6MTc3NTg1OTgxOCwiZXhwIjoxNzc1ODYwNzE4LCJpc3MiOiJkaXJlY3R1cyJ9.uuvF22Cac4F0mU1InsevTMHJRDas1CLfxFe5JuedNMo';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function createAuthor(author) {
  try {
    const response = await fetch(`${BASE_URL}/items/authors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        name: author.name,
        slug: slugify(author.name),
        bio_fr: author.bio_fr,
        bio_en: author.bio_en,
        bio_ar: author.bio_ar,
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

async function createBook(book, authorId) {
  try {
    const response = await fetch(`${BASE_URL}/items/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        title: book.title || 'Untitled',
        slug: slugify(book.title || 'untitled'),
        author_id: authorId,
        author_name: book.author_name,
        description: book.description || 'No description',
        description_en: book.description_en,
        description_ar: book.description_ar,
        price_dt: book.price_dt,
        price_eur: book.price_eur,
        isbn: book.isbn,
        pages: book.pages,
        year: book.year,
        language: book.language,
        category: book.category,
        status: 'published',
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

async function createNews(newsItem) {
  try {
    const response = await fetch(`${BASE_URL}/items/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        title: newsItem.title,
        slug: slugify(newsItem.title),
        content: newsItem.content,
        content_ar: newsItem.content_ar,
        date: newsItem.date,
        status: 'published',
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

async function createHeroSection(hero) {
  try {
    const response = await fetch(`${BASE_URL}/items/hero_sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        title: hero.title,
        title_en: hero.title_en,
        title_ar: hero.title_ar,
        subtitle: hero.subtitle,
        subtitle_en: hero.subtitle_en,
        subtitle_ar: hero.subtitle_ar,
        cta_label: hero.cta_label,
        cta_label_en: hero.cta_label_en,
        cta_label_ar: hero.cta_label_ar,
        cta_url: hero.cta_url,
        order: hero.order ?? 0,
        status: 'active',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✓ Created hero: ${hero.title}`);
      return data.data.id;
    } else {
      const error = await response.text();
      console.error(`✗ Failed to create hero ${hero.title}:`, error);
    }
  } catch (error) {
    console.error(`✗ Error creating hero ${hero.title}:`, error);
  }
  return null;
}

async function seed() {
  console.log('🚀 Starting seed...\n');

  const authorMap = new Map();

  console.log('📚 Creating Authors...');
  for (const author of seedData.authors) {
    const id = await createAuthor(author);
    if (id) authorMap.set(author.name, id);
  }
  console.log(`✓ Created ${authorMap.size} authors\n`);

  console.log('📖 Creating Books...');
  let booksCreated = 0;
  for (const book of seedData.books) {
    const authorId = authorMap.get(book.author_name);
    if (authorId) {
      const result = await createBook(book, authorId);
      if (result) booksCreated++;
    } else {
      console.log(`✗ Author not found: ${book.author_name}`);
    }
  }
  console.log(`✓ Created ${booksCreated} books\n`);

  console.log('📰 Creating News...');
  let newsCreated = 0;
  for (const newsItem of seedData.news) {
    const result = await createNews(newsItem);
    if (result) newsCreated++;
  }
  console.log(`✓ Created ${newsCreated} news\n`);

  console.log('🏠 Creating Hero Sections...');
  let heroesCreated = 0;
  for (const hero of seedData.hero_sections || []) {
    const result = await createHeroSection(hero);
    if (result) heroesCreated++;
  }
  console.log(`✓ Created ${heroesCreated} heroes\n`);

  console.log('✨ Seed Complete!');
}

seed();

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_EMAIL = 'admin@contraste.tn';
const DIRECTUS_PASSWORD = 'contrase123';

async function login() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DIRECTUS_EMAIL, password: DIRECTUS_PASSWORD }),
  });
  const data = await res.json();
  return data.data?.access_token;
}

async function createItem(collection, data, token) {
  const res = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (result.errors) {
    console.log(`Error creating ${collection}:`, result.errors);
    return null;
  }
  console.log(`Created ${collection}:`, result.data?.id);
  return result.data;
}

async function main() {
  console.log('Logging in to Directus...');
  const token = await login();
  if (!token) {
    console.error('Failed to login');
    process.exit(1);
  }
  console.log('Logged in');

  // Create a test author
  const author = await createItem('authors', {
    name: 'Nelly Amri',
    bio_fr: 'Historienne et Professeure des Universités',
    bio_en: 'Historian and University Professor',
    bio_ar: 'مؤرخة وأستاذة جامعية',
    slug: 'nelly-amri',
  }, token);

  // Create a test book
  if (author) {
    await createItem('books', {
      title: 'Le soufisme en Tunisie',
      slug: 'le-soufisme-en-tunisie',
      description: 'Un ouvrage sur l\'histoire du soufisme en Tunisie.',
      description_ar: 'كتاب عن تاريخ التصوف في تونس',
      author_id: author.id,
      price_dt: 25,
      price_eur: 8,
      year: 2024,
      pages: 200,
      language: 'Français',
      status: 'published',
    }, token);
  }

  // Create a test news
  await createItem('news', {
    title: 'Bienvenue chez Contraste Éditions',
    slug: 'bienvenue-contraste-editions',
    content: 'Nous sommes heureux de vous accueillir sur notre nouvelle plateforme.',
    content_ar: ' nous sommes heureux de vous accueillir sur notre nouvelle plateforme.',
    date: new Date().toISOString().split('T')[0],
    status: 'published',
  }, token);

  console.log('Seed completed!');
}

main().catch(console.error);

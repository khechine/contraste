import dotenv from 'dotenv';
import { Press } from './types';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN;

const pressItems = [
  {
    title: "Contraste Editions remporte le Prix Noureddine Ben Khedher de l'Édition à la FILT 2025",
    media_name: "Kapitalis",
    publication_date: "2025-05-02",
    excerpt: "Le palmarès de la 39e édition de la Foire internationale du livre de Tunis a été dévoilé. Contraste Editions a été honorée par le prestigieux prix Noureddine Ben Khedher de l'édition pour son excellence éditoriale.",
    article_url: "https://kapitalis.com/tunisie/2025/05/02/palmares-de-la-foire-internationale-du-livre-de-tunis-2025/",
    featured: true,
  },
  {
    title: "Double succès pour Contraste Éditions au Prix Abdelwaheb Ben Ayed",
    media_name: "Managers",
    publication_date: "2022-11-17",
    excerpt: "Lors de la deuxième édition du Prix Abdelwaheb Ben Ayed, Contraste Éditions a brillé en remportant deux catégories : le prix du roman en langue française pour 'D’une oasis à l’autre' d’Abdellatif Mrabet, et le prix de la poésie pour le recueil de Mohamed Ghozzi.",
    article_url: "https://managers.tn/2022/11/17/les-promesses-de-la-deuxieme-edition-du-prix-abdelwaheb-ben-ayed-de-litterature/",
    featured: true,
  },
  {
    title: "Synchronicité de Houbeb Khechine : le récit d'une rencontre qui défie la raison",
    media_name: "La Presse",
    publication_date: "2026-03-17",
    excerpt: "Après un long chemin dans l'univers éditorial, Houbeb Khéchine publie son premier livre chez Contraste Editions. 'Synchronicité' est un récit fantastico-historique explorant une rencontre improbable entre Louis II de Bavière et Mohamed Rachid Bey.",
    article_url: "https://www.lapresse.tn/2026/03/17/synchronicite-de-houbeb-khechine-le-recit-dune-rencontre-qui-defie-la-raison/",
    featured: false,
  }
];

async function directusFetch(endpoint: string, init?: RequestInit): Promise<any> {
  const url = `${BASE_URL}/${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  };

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Directus error (${response.status}): ${errorBody}`);
  }
  return response.json();
}

async function ensurePressCollection() {
  console.log('--- Ensuring "press" collection schema ---');
  
  try {
    // Check if collection exists
    await directusFetch(`collections/press`);
    console.log('✓ Collection "press" already exists.');
  } catch (e) {
    console.log('Creating collection "press"...');
    await directusFetch('collections', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'press',
        schema: {},
        meta: { icon: 'newspaper', note: 'Press coverage and awards' }
      })
    });
  }

  // Define fields
  const fields = [
    { field: 'title', type: 'string', meta: { display: 'text' } },
    { field: 'media_name', type: 'string', meta: { display: 'text' } },
    { field: 'publication_date', type: 'date', meta: { display: 'datetime' } },
    { field: 'excerpt', type: 'text', meta: { display: 'text-multiline' } },
    { field: 'article_url', type: 'string', meta: { display: 'text' } },
    { field: 'logo', type: 'uuid', meta: { display: 'file' } },
    { field: 'file_attachment', type: 'uuid', meta: { display: 'file' } },
    { field: 'featured', type: 'boolean', meta: { display: 'boolean' } },
  ];

  for (const field of fields) {
    try {
      await directusFetch(`fields/press/${field.field}`);
      // console.log(`✓ Field ${field.field} exists.`);
    } catch (e) {
      console.log(`Creating field "${field.field}"...`);
      await directusFetch('fields/press', {
        method: 'POST',
        body: JSON.stringify(field)
      });
    }
  }
}

async function grantPublicReadAccess() {
  console.log('\n--- Granting public read access to "press" collection ---');
  try {
    // Check if permission already exists
    const existing = await directusFetch('permissions?filter[collection][_eq]=press&filter[role][_null]=true');
    if (existing.data && existing.data.length > 0) {
      console.log('✓ Public read access already granted.');
      return;
    }

    await directusFetch('permissions', {
      method: 'POST',
      body: JSON.stringify({
        role: null,
        collection: 'press',
        action: 'read',
        permissions: {},
        validation: {},
        fields: ['*']
      })
    });
    console.log('✓ Public read access granted!');
  } catch (e: any) {
    console.error(`✗ Failed to grant public access: ${e.message}`);
  }
}

async function seedPress() {
  await ensurePressCollection();
  await grantPublicReadAccess();

  console.log('\n--- Seeding press items ---');
  for (const item of pressItems) {
    try {
      // Simple check to avoid duplicates based on title
      const existing = await directusFetch(`items/press?filter[title][_eq]=${encodeURIComponent(item.title)}`);
      if (existing.data && existing.data.length > 0) {
        console.log(`! Item already exists: ${item.title}`);
        continue;
      }

      await directusFetch('items/press', {
        method: 'POST',
        body: JSON.stringify(item)
      });
      console.log(`✓ Created: ${item.title}`);
    } catch (e: any) {
      console.error(`✗ Failed to create ${item.title}: ${e.message}`);
    }
  }
}

seedPress()
  .then(() => console.log('\n✨ Database seeding complete!'))
  .catch((err) => console.error('\n💥 Seeding failed:', err));

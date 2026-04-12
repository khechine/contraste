import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
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

async function uploadFile(filePath: string): Promise<string | null> {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.warn(`! File not found: ${absolutePath}`);
    return null;
  }

  console.log(`Uploading file: ${path.basename(absolutePath)}...`);
  const stats = fs.statSync(absolutePath);
  const formData = new FormData();
  
  const blob = new Blob([fs.readFileSync(absolutePath)]);
  formData.append('file', blob, path.basename(absolutePath));

  try {
    const response = await fetch(`${BASE_URL}/files`, {
      method: 'POST',
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('✗ Upload failed:', error);
      return null;
    }

    const json = await response.json();
    console.log(`✓ File uploaded: ${json.data.id}`);
    return json.data.id;
  } catch (error) {
    console.error('✗ Upload error:', error);
    return null;
  }
}

async function ensureRelationship(field: string) {
  try {
    await directusFetch(`relations/press/${field}`);
    // console.log(`✓ Relationship for press.${field} exists.`);
  } catch (e) {
    console.log(`Creating relationship for "press.${field}"...`);
    await directusFetch('relations', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'press',
        field: field,
        related_collection: 'directus_files',
        schema: { on_delete: 'SET NULL' },
        meta: { interface: 'file', display: 'file' }
      })
    });
  }
}

async function ensurePressCollection() {
  console.log('--- Ensuring "press" collection schema ---');
  
  try {
    await directusFetch('collections/press');
    console.log('✓ Collection "press" exists.');
  } catch (e) {
    console.log('Creating collection "press"...');
    await directusFetch('collections', {
      method: 'POST',
      body: JSON.stringify({
        collection: 'press',
        meta: { icon: 'newspaper', note: 'Press coverage and awards' }
      })
    });
  }

  const fields = [
    { field: 'title', type: 'string', meta: { display: 'text' } },
    { field: 'media_name', type: 'string', meta: { display: 'text' } },
    { field: 'publication_date', type: 'date', meta: { display: 'datetime' } },
    { field: 'excerpt', type: 'text', meta: { display: 'text-multiline' } },
    { field: 'article_url', type: 'string', meta: { display: 'text' } },
    { field: 'logo', type: 'uuid', meta: { display: 'file', interface: 'file' } },
    { field: 'file_attachment', type: 'uuid', meta: { display: 'file', interface: 'file' } },
    { field: 'featured', type: 'boolean', meta: { display: 'boolean' } },
  ];

  for (const field of fields) {
    try {
      await directusFetch(`fields/press/${field.field}`);
    } catch (e) {
      console.log(`Creating field "${field.field}"...`);
      await directusFetch('fields/press', {
        method: 'POST',
        body: JSON.stringify(field)
      });
    }
  }

  // Set relationships for file fields
  await ensureRelationship('logo');
  await ensureRelationship('file_attachment');
}

async function grantPublicAccess(collection: string) {
  console.log(`--- Granting public read access to "${collection}" collection ---`);
  try {
    const existing = await directusFetch(`permissions?filter[collection][_eq]=${collection}&filter[role][_null]=true`);
    if (existing.data && existing.data.length > 0) {
      console.log(`✓ Public read access to "${collection}" already granted.`);
      return;
    }

    await directusFetch('permissions', {
      method: 'POST',
      body: JSON.stringify({
        role: null,
        collection: collection,
        action: 'read',
        permissions: {},
        validation: {},
        fields: ['*']
      })
    });
    console.log(`✓ Public read access to "${collection}" granted!`);
  } catch (e: any) {
    console.error(`✗ Failed to grant public access to "${collection}": ${e.message}`);
  }
}

async function seedPress() {
  await ensurePressCollection();
  await grantPublicAccess('press');
  await grantPublicAccess('directus_files');

  console.log('\n--- Seeding press items ---');
  for (const item of pressItems) {
    try {
      const existingResponse = await directusFetch(`items/press?filter[title][_eq]=${encodeURIComponent(item.title)}`);
      if (existingResponse.data && existingResponse.data.length > 0) {
        console.log(`! Item already exists: ${item.title}`);
        
        // If it's the Kapitalis item and doesn't have a PDF, let's update it
        if (item.media_name === 'Kapitalis') {
          const currentItem = existingResponse.data[0];
          if (!currentItem.file_attachment) {
            console.log('Attempting to attach PDF to Kapitalis item...');
            const fileId = await uploadFile('public/Document 144.pdf');
            if (fileId) {
              await directusFetch(`items/press/${currentItem.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ file_attachment: fileId })
              });
              console.log('✓ PDF attached and item updated.');
            }
          }
        }
        continue;
      }

      let fileId = null;
      if (item.media_name === 'Kapitalis') {
        fileId = await uploadFile('public/Document 144.pdf');
      }

      await directusFetch('items/press', {
        method: 'POST',
        body: JSON.stringify({ ...item, file_attachment: fileId })
      });
      console.log(`✓ Created: ${item.title}`);
    } catch (e: any) {
      console.error(`✗ Failed to process ${item.title}: ${e.message}`);
    }
  }
}

seedPress()
  .then(() => console.log('\n✨ Database maintenance and seeding complete!'))
  .catch((err) => console.error('\n💥 Operation failed:', err));

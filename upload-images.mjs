import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const BASE_URL = 'http://91.134.133.118:8055';
const IMAGE_DIR = './public/images/seed';

async function getToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@contrasete.tn', password: 'contrase123' }),
  });
  const data = await res.json();
  return data.data.access_token;
}

async function uploadImage(token, filepath) {
  const filename = basename(filepath);
  const fileBuffer = readFileSync(filepath);
  const blob = new Blob([fileBuffer]);
  const formData = new FormData();
  formData.append('file', blob, filename);

  const res = await fetch(`${BASE_URL}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  
  const data = await res.json();
  if (data.data?.id) {
    console.log(`✓ ${filename} -> ${data.data.id}`);
    return data.data.id;
  } else {
    console.log(`✗ ${filename}: ${data.errors?.[0]?.message || 'failed'}`);
    return null;
  }
}

async function main() {
  const token = await getToken();
  console.log('Got token, uploading images...\n');

  const files = readdirSync(IMAGE_DIR).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  );

  for (const file of files) {
    const filepath = join(IMAGE_DIR, file);
    await uploadImage(token, filepath);
  }
  
  console.log('\nDone!');
}

main();

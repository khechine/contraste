
const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus.contraste.tn';
const TOKEN = process.env.DIRECTUS_TOKEN;

async function repair() {
  console.log('🔍 Starting author photo repair...');
  
  // 1. Fetch all authors
  const authorsRes = await fetch(`${BASE_URL}/items/authors`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const { data: authors } = await authorsRes.json();
  console.log(`Found ${authors.length} authors.`);

  // 2. Fetch all files from directus
  const filesRes = await fetch(`${BASE_URL}/files`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const { data: files } = await filesRes.json();
  console.log(`Found ${files.length} files in Directus.`);

  // 3. Match and Update
  for (const author of authors) {
    if (author.photo) continue; // Already has a photo

    // Try to find a file that matches the author name
    // Filenames like: photo-Nelly-AMRI.jpg, Abdelatif-Mrabet.jpg
    const match = files.find(f => {
      const name = author.name.toLowerCase();
      const filename = f.filename_download.toLowerCase();
      return filename.includes(name.replace(' ', '-')) || name.includes(filename.split('.')[0]);
    });

    if (match) {
      console.log(`✅ Matching ${author.name} with file ${match.filename_download} (${match.id})`);
      await fetch(`${BASE_URL}/items/authors/${author.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ photo: match.id })
      });
    } else {
      console.log(`❌ No match found for ${author.name}`);
    }
  }
  
  console.log('✨ Repair finished!');
}

repair().catch(console.error);

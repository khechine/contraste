const authors = {
  "Nelly Amri": { photo: "57f82054-f21b-4c94-adf0-6aefa55d5333" },
  "Samir Makhlouf": { photo: "d221e96f-244a-44b9-bb10-c794977f4564" },
  "Samir Aounallah": { photo: "08a1a7a4-93b3-4357-985a-0438eccfe6dd" },
  "Abdellatif Mrabet": { photo: "253fde59-9c53-47aa-9efd-4c20b402dfd9" },
  "Ali Louati": { photo: "96b70fc4-fec7-4d3b-a83b-402db1e9c390" },
  "Hassen El Annabi": { photo: "8e46d280-01a1-4778-8eb8-310bce78e6ae" },
  "Abdelmajid Ennabli": { photo: "af46282b-a6d0-4585-81a0-adb2ee28bb09" },
  "Mohamed Ghozzi": { photo: null },
  "Hichem Ben Ammar": { photo: "5885526d-db35-4d49-9546-48fb99229a4c" },
  "Mouayed El Mnari": { photo: "986c96ab-84af-41b7-8f37-8eeb0ade5a29" },
  "Mona Belhaj": { photo: "772a874d-64e2-49a3-b571-da0ec6765301" },
  "Dora Latiri": { photo: "3dadc0fb-691d-4d7c-9281-8aef803055dd" },
  "Collectif d'auteurs": { photo: null },
  "Michel Pieffer": { photo: null },
  "Lassaad Ben Abdallah": { photo: "58d751ab-9a47-40d2-8983-3bcb52677434" },
  "Neji Djelloul": { photo: "d0c9f496-5655-43de-9afc-5b6e330944fc" },
  "Slaheddine Haddad": { photo: "141cce1b-e550-4197-ba88-216ce58770fb" },
  "Mohamed Walim Rokbani": { photo: "27c8075e-30d0-4c2b-97f6-d173096a24a4" },
  "Mohamed Louadi": { photo: "2b677592-7e3d-465e-85b9-f5caa6033e4a" },
  "Mohamed Yacoub": { photo: "b7bb1b74-fe37-4dc7-b41f-a8d0e3a83648" },
  "Möez Majed": { photo: "a8dec605-8508-4804-9c41-3c7e66f3b770" },
  "Samar Mannaa": { photo: "17b08d0b-3dfe-48fd-bd35-5733ed4b27c2" },
  "Saloua Mestiri": { photo: "156f2edc-c296-44b5-94c3-0b75ddaa4555" },
  "Ridha Boukhris": { photo: "5d29528c-9bab-4b01-bb6a-a6c5dbf2c9c7" },
  "Paul Eudel": { photo: "4f5f85d4-8087-437f-9788-66ab24caf3d4" },
  "Mustapha Kilani": { photo: "b7d1a72a-64ed-4da0-a7f5-b5dad3e88582" },
  "Hamma Hanachi": { photo: "27842f01-db10-48c9-b8bd-c4512af22ecf" },
  "Houssine Kahwagi": { photo: "5463863c-bdcd-43ce-9795-6ad28ae8db92" },
  "Aicha Filali": { photo: "274e64a1-e3d1-46e1-a7d1-70720cd716a7" },
  "Azza Filali": { photo: "8807dea7-79df-4379-90d2-c38bb6a6c2bc" },
  "Ala Lassoued": { photo: "8ef0ecb4-9a17-49fc-8f6d-3e6f3ba96ed7" },
  "Ahmed Albahi": { photo: "b04ee656-a935-41a0-b21b-37dde674ee76" },
  "Abdelkrim Chalbi": { photo: "2eded0fc-5937-4296-93f8-b217235c1d33" },
  "Kahina Abbass": { photo: "adb3bdf1-5392-4e55-b83e-d5506f0dced0" }
};

const books = {
  "Kairouan: la ville et ses saints": "36c654eb-e65e-4135-8a90-e0acd064531b",
  "Le voyage archéologique de Victor Guérin": "e650870c-283b-49b8-a325-6ffa88f46574",
  "Abrégé de la Médina de Tunis": "eb4a46d2-c9b2-4c98-be05-8623f61b88f2",
  "CHRONIQUES D'ARCHÉOLOGIE MAGHRÉBINE": "15896a78-a64f-4514-b9c7-f4c3199366a4",
  "Visa pour le monde": "e19deb74-3014-45d9-87d3-fe1f384566fc",
  "Merminus Infinitif": "c1845e25-d664-4011-9223-743af4d92673",
  "D'une oasis à l'autre": "b1648e75-5c30-45d9-a96e-672f8f2f3e56",
  "Le vert et le bleu": "b1648e75-5c30-45d9-a96e-672f8f2f3e56",
  "Grabuge": "de0afaee-dfb0-4491-86a0-a543937d897a",
  "SUR LES PAS DES MAÎTRES": "cc80a510-dca4-4fd8-87d5-7ea4ce903223",
  "Artistes de Tunisie": "b7e892a3-adf8-4ab8-8462-18aedd941983",
  "Elle": "27842f01-db10-48c9-b8bd-c4512af22ecf",
  "être Palestinien au Liban": "17b08d0b-3dfe-48fd-bd35-5733ed4b27c2",
  "Je ne saurai jamais": "b1580083-9ddf-407c-b6a1-2f1bd0f0702e",
  "Je te nommerai": "85528ad7-4fbf-4aaa-bf2c-01e4936e0b32",
  "Kairouan La Grande Mosquée": "542e1901-7076-4b55-a8ed-b207e0929533",
  "L'art de bât ir au jérid": "14a3ffe3-7a7b-4ac9-9698-b56e5cb0d4ff",
  "L'homme de Gayeh": "fdc02ca4-9308-4969-bc75-53a03117e05d",
  "L'abrégé du Musée National du Bardo": "0088e80e-400a-48cd-ad83-7bd3caa286d2",
  "Le bruit des étoiles": "27c8075e-30d0-4c2b-97f6-d173096a24a4",
  "Le Musée Archéologique de Sousse": "a91ad7cc-4344-4f31-8592-dd58c8846c39",
  "Les auto-stoppeurs": "fba80d56-62a6-4376-adb3-ded575e3688e",
  "Les Merveilles Du Musée Du Bardo": "bdf51685-8dc8-4d9a-8285-9efae6c2cc8d",
  "Les rêveries d'un cerisier": "885d349f-4cea-48e3-8526-eba77b45be24",
  "Littérature de femmes tunisiennes": "5d29528c-9bab-4b01-bb6a-a6c5dbf2c9c7",
  "MAHDIA Capitale des Fâtimides": "6b01cd92-6356-48a1-b782-51755635fd0d",
  "Une jeunesse d'enfer": "2b677592-7e3d-465e-85b9-f5caa6033e4a",
  "أحفاد سقراط": "0a13d88d-7a56-4ca5-9ebe-1e4851828028",
  "التصوف بإفريقية": "2149781a-eb95-4b88-a786-b2ec87fe82d4",
  "الجنرال": "b7d1a72a-64ed-4da0-a7f5-b5dad3e88582",
  "نخاف لا ننسى": "91d10ee6-8d1a-4537-a3a3-a6a8e954a550",
  "Citrons doux": "3dadc0fb-691d-4d7c-9281-8aef803055dd",
  "CARTHAGE": "e8ac35e6-c6d3-4c21-ad0c-ef97c8308792",
  "Captures": "3c335e7c-f22d-451e-9d6e-c9c9a5811134"
};

const BASE_URL = 'http://91.134.133.118:8055';

async function getToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@contrasete.tn', password: 'contrase123' }),
  });
  const data = await res.json();
  return data.data.access_token;
}

async function updateBook(token, title, coverId) {
  const res = await fetch(`${BASE_URL}/items/books?filter[title][_eq]=${encodeURIComponent(title)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.data?.[0]) {
    const id = data.data[0].id;
    await fetch(`${BASE_URL}/items/books/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ cover_image: coverId })
    });
    console.log(`✓ Updated book: ${title}`);
  }
}

async function updateAuthor(token, name, photoId) {
  const res = await fetch(`${BASE_URL}/items/authors?filter[name][_eq]=${encodeURIComponent(name)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.data?.[0]) {
    const id = data.data[0].id;
    await fetch(`${BASE_URL}/items/authors/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo: photoId })
    });
    console.log(`✓ Updated author: ${name}`);
  }
}

async function main() {
  const token = await getToken();
  
  console.log('Updating books with cover images...');
  for (const [title, coverId] of Object.entries(books)) {
    if (coverId) await updateBook(token, title, coverId);
  }
  
  console.log('\nUpdating authors with photos...');
  for (const [name, data] of Object.entries(authors)) {
    if (data.photo) await updateAuthor(token, name, data.photo);
  }
  
  console.log('\nDone!');
}

main();

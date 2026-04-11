const authors = {
  "Nelly Amri": "90a97d93-7ba2-41f0-aafd-793b5b40acba",
  "Samir Makhlouf": "1259f45f-9a00-4417-9825-f9b5ca924f75",
  "Samir Aounallah": "005b7d45-8cfc-4290-8476-7190b0c22bcc",
  "Abdellatif Mrabet": "83d5cdc2-860a-40b9-9ccd-4979c71ccff2",
  "Ali Louati": "357389d6-c7cc-4a1f-becd-b8fb7ebf7b1b",
  "Hassen El Annabi": "1faeb739-725f-4ac2-a5cd-a18b5baa3fd9",
  "Abdelmajid Ennabli": "e3de0eca-51cd-4e71-b381-4a05daadd40d",
  "Mohamed Ghozzi": "afe58585-ee7f-4b3b-abce-6b032cc0d085",
  "Hichem Ben Ammar": "44c85148-5f77-4f51-b9af-bfb21b075b0c",
  "Mouayed El Mnari": "ccd756cc-47d7-40e4-a6c7-5da5825280f2",
  "Mona Belhaj": "d14f86b1-63ea-43c6-8f8e-fcfce3be045a",
  "Dora Latiri": "b892d1ce-074a-43df-8163-7f183aabb4d0",
  "Collectif d'auteurs": "20293ba1-1c46-4ae1-8a93-a199ac8322cb",
  "Michel Pieffer": "36a54542-8546-4640-8347-fc32ef9492c9",
  "Lassaad Ben Abdallah": "9bb062a6-3f24-439b-aae3-5a27a5e697b5",
  "Neji Djelloul": "c7fe6d48-0cda-4cb3-b845-c2c211751eba",
  "Slaheddine Haddad": "f62319ab-7a3d-4da2-b039-c9d623a5d9d9",
  "Mohamed Walim Rokbani": "78c91596-bb94-4c34-a31b-087153a2f302",
  "Mohamed Louadi": "c420a9ab-5897-4315-b90a-84acc1988a67",
  "Mohamed Yacoub": "672d8652-58b5-48f7-baef-ae6678268039",
  "Möez Majed": "57b83ab9-518e-4668-9dbf-32e652ab94bd",
  "Samar Mannaa": "be2cffa6-3933-4206-ad3c-57ed7a9785cb",
  "Saloua Mestiri": "a0004693-dbd1-4756-933c-2397623717c8",
  "Ridha Boukhris": "ffc916b8-1ef9-4e34-91f8-4f33f6a6c8ca",
  "Paul Eudel": "32f8a919-d015-4dc3-beb7-1d409de3821b",
  "Mustapha Kilani": "b8fe156e-1ebb-489b-8ce4-7152539aa80f",
  "Hamma Hanachi": "7b73c192-2a63-4d44-93e4-68f1c23e8a7c",
  "Houssine Kahwagi": "cadaa7f5-e5bb-4d90-9ab3-184e33fb9d0e",
  "Aicha Filali": "0219d273-a5a1-403e-ada1-2e906bf9572b",
  "Azza Filali": "7a59a300-6479-41e5-ac1c-df8845d6a845",
  "Ala Lassoued": "622b0933-2b5b-484f-b4b6-db1a07ea6e6b",
  "Ahmed Albahi": "dd5f194d-cfb4-48e1-a7eb-98182d0aa032",
  "Abdelkrim Chalbi": "9c73387a-d3cb-4cdd-b957-59fcb06237dd",
  "Kahina Abbass": "0de7036c-f793-418e-bbb0-0c4b69a20656"
};

const books = [
  { title: "Kairouan: la ville et ses saints", author: "Nelly Amri", price_dt: 35, price_eur: 17, year: 2023, category: "Histoire", isbn: "978-9938-00-001-1", pages: 280, language: "Français" },
  { title: "Le voyage archéologique de Victor Guérin", author: "Abdelmajid Ennabli", price_dt: 25, price_eur: 12, year: 2022, category: "Archéologie", isbn: "978-9938-00-002-8", pages: 200, language: "Français" },
  { title: "Abrégé de la Médina de Tunis", author: "Hassen El Annabi", price_dt: 45, price_eur: 22, year: 2021, category: "Histoire", isbn: "978-9938-00-003-5", pages: 320, language: "Français" },
  { title: "CHRONIQUES D'ARCHÉOLOGIE MAGHRÉBINE", author: "Collectif d'auteurs", price_dt: 35, price_eur: 17, year: 2020, category: "Archéologie", isbn: "978-9938-00-004-2", pages: 250, language: "Français" },
  { title: "Visa pour le monde", author: "Michel Pieffer", price_dt: 15, price_eur: 8, year: 2019, category: "Essai", isbn: "978-9938-00-005-9", pages: 180, language: "Français" },
  { title: "Merminus Infinitif", author: "Samir Makhlouf", price_dt: 20, price_eur: 10, year: 2020, category: "Roman", isbn: "978-9938-00-010-3", pages: 160, language: "Français" },
  { title: "D'une oasis à l'autre", author: "Abdellatif Mrabet", price_dt: 18, price_eur: 9, year: 2025, category: "Roman", isbn: "978-9938-00-013-4", pages: 240, language: "Français" },
  { title: "Le vert et le bleu", author: "Abdellatif Mrabet", price_dt: 20, price_eur: 10, year: 2025, category: "Roman", isbn: "978-9938-00-014-1", pages: 220, language: "Français" },
  { title: "Grabuge", author: "Hichem Ben Ammar", price_dt: 10, price_eur: 5, year: 2020, category: "Poésie", isbn: "978-9938-00-015-8", pages: 96, language: "Français" },
  { title: "SUR LES PAS DES MAÎTRES", author: "Nelly Amri", price_dt: 30, price_eur: 15, year: 2023, category: "Soufisme", isbn: "978-9938-00-017-2", pages: 320, language: "Français" },
  { title: "Artistes de Tunisie", author: "Ali Louati", price_dt: 20, price_eur: 10, year: 2017, category: "Art", isbn: "978-9938-00-018-9", pages: 200, language: "Français" },
  { title: "Elle", author: "Hamma Hanachi", price_dt: 15, price_eur: 8, category: "Roman" },
  { title: "être Palestinien au Liban", author: "Samar Mannaa", price_dt: 20, price_eur: 10, category: "Essai" },
  { title: "Je ne saurai jamais", author: "Slaheddine Haddad", price_dt: 22, price_eur: 11, category: "Roman" },
  { title: "Je te nommerai", author: "Saloua Mestiri", price_dt: 18, price_eur: 9, category: "Roman" },
  { title: "Kairouan La Grande Mosquée", author: "Neji Djelloul", price_dt: 6, price_eur: 3, category: "Guide" },
  { title: "L'art de bât ir au jérid", author: "Abdellatif Mrabet", price_dt: 12, price_eur: 6, category: "Histoire" },
  { title: "L'homme de Gayeh", author: "Samir Makhlouf", price_dt: 20, price_eur: 10, category: "Roman" },
  { title: "L'abrégé du Musée National du Bardo", author: "Samir Aounallah", price_dt: 20, price_eur: 10, category: "Guide" },
  { title: "Le bruit des étoiles", author: "Mohamed Walim Rokbani", price_dt: 15, price_eur: 8, category: "Roman" },
  { title: "Le Musée Archéologique de Sousse", author: "Samir Aounallah", price_dt: 20, price_eur: 10, category: "Guide" },
  { title: "Les auto-stoppeurs", author: "Slaheddine Haddad", price_dt: 5, price_eur: 3, category: "Poésie" },
  { title: "Les Merveilles Du Musée Du Bardo", author: "Mohamed Yacoub", price_dt: 15, price_eur: 8, category: "Guide" },
  { title: "Les rêveries d'un cerisier", author: "Möez Majed", price_dt: 5, price_eur: 3, category: "Poésie" },
  { title: "Littérature de femmes tunisiennes", author: "Ridha Boukhris", price_dt: 25, price_eur: 12, category: "Essai" },
  { title: "MAHDIA Capitale des Fâtimides", author: "Neji Djelloul", price_dt: 13, price_eur: 7, category: "Histoire" },
  { title: "Une jeunesse d'enfer", author: "Mohamed Louadi", price_dt: 15, price_eur: 8, category: "Roman" },
  { title: "أحفاد سقراط", author: "Houssine Kahwagi", price_dt: 6, price_eur: 3, category: "Poésie", language: "Arabe" },
  { title: "التصوف بإفريقية", author: "Nelly Amri", price_dt: 12, price_eur: 6, category: "Soufisme", language: "Arabe" },
  { title: "الجنرال", author: "Mustapha Kilani", price_dt: 10, price_eur: 5, category: "Roman", language: "Arabe" },
  { title: "نخاف لا ننسى", author: "Mona Belhaj", price_dt: 20, price_eur: 10, category: "Roman", language: "Arabe" },
  { title: "Citrons doux", author: "Dora Latiri", price_dt: 12, price_eur: 6, category: "Roman" },
  { title: "CARTHAGE", author: "Abdelmajid Ennabli", price_dt: 15, price_eur: 8, category: "Guide" },
  { title: "Captures", author: "Aicha Filali", price_dt: 25, price_eur: 12, category: "Photo" }
];

const BASE_URL = 'http://91.134.133.118:8055';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNhZmY4NDZmLTUwYTgtNDFmNy04OTQwLTdjMTI5MTE3OTY5NSIsInJvbGUiOiJkODQ4NDk2MS01NzdiLTRmMmMtYmM0Ny0wNWM5ODJlMTU5M2YiLCJhcHBfYWNjZXNzIjp0cnVlLCJhZG1pbl9hY2Nlc3MiOnRydWUsImlhdCI6MTc3NTc0MzcyMywiZXhwIjoxNzc1NzQ0NjIzLCJpc3MiOiJkaXJlY3R1cyJ9.fxfI4nejX4kMf2V4jcXnrdvUjk6mCGjC-gefNr8taQY';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function createBook(book) {
  const authorId = authors[book.author];
  if (!authorId) {
    console.log(`✗ Author not found: ${book.author}`);
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/items/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        title: book.title,
        slug: slugify(book.title),
        author_id: authorId,
        author_name: book.author,
        price_dt: book.price_dt,
        price_eur: book.price_eur,
        year: book.year,
        category: book.category,
        isbn: book.isbn,
        pages: book.pages,
        language: book.language || 'Français',
        status: 'published',
      }),
    });

    if (response.ok) {
      console.log(`✓ Created book: ${book.title}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`✗ Failed: ${book.title}:`, error);
    }
  } catch (error) {
    console.error(`✗ Error: ${book.title}:`, error);
  }
  return null;
}

async function seed() {
  console.log('📖 Creating Books...\n');
  for (const book of books) {
    await createBook(book);
  }
  console.log('\n✨ Done!');
}

seed();

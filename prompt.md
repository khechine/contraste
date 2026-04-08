Act as a senior full-stack developer and product designer.

Build a modern multilingual publishing house website using:

- Next.js (App Router)
- Tailwind CSS
- Framer Motion
- Directus as a headless CMS (very simple for non-technical admins)

LANGUAGES:
- French (fr)
- English (en)
- Arabic (ar, RTL support required)

OBJECTIVE:
Create a clean, editorial, premium website that is:
- Easy to manage (non-technical users)
- SEO optimized
- Fast and scalable

CMS STRUCTURE (VERY IMPORTANT: keep it simple):

Books:
- titre_fr / titre_en / titre_ar
- description_fr / description_en / description_ar
- price_dt / price_eur
- cover image
- author (relation)
- publication date
- featured

Authors:
- name
- bio_fr / bio_en / bio_ar
- photo

News:
- titre_fr / titre_en / titre_ar
- contenu_fr / contenu_en / contenu_ar
- image
- date

FRONTEND REQUIREMENTS:

- Language-based routing:
  /fr /en /ar

- Dynamic content rendering:
  use fields based on locale (ex: titre_fr)

- RTL support for Arabic:
  - dir="rtl"
  - mirrored layout

- Pricing logic:
  - Tunisia → DT
  - International → EUR
  - or display both

PAGES:
- Home
- Books
- Book detail
- Authors
- News
- Contact

UX/UI:
- Minimalist editorial design
- Strong typography
- Clean layout
- Smooth animations

IMPORTANT:
- Keep CMS extremely simple
- No complex nested structures
- Clear labels for non-technical users
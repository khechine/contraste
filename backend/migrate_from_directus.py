"""
Script de migration des données de Directus vers Django.
Usage: python migrate_from_directus.py

Ce script lit les données existantes via l'API Directus
et les insère dans la base de données Django via l'API Django REST.
"""
import os
import sys
import json
import time
import requests
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────
DIRECTUS_URL = os.environ.get('DIRECTUS_URL', 'http://localhost:8055')
DIRECTUS_TOKEN = os.environ.get('DIRECTUS_TOKEN', '1f3cb29e4aaff6ffdcf024072f247b7c7bad390f735b022d986463ceb8defe04')

DJANGO_URL = os.environ.get('DJANGO_URL', 'http://localhost:8000')
DJANGO_EMAIL = os.environ.get('DJANGO_EMAIL', 'admin@contraste.tn')
DJANGO_PASSWORD = os.environ.get('DJANGO_PASSWORD', 'admin1234')

HEADERS_DIRECTUS = {'Authorization': f'Bearer {DIRECTUS_TOKEN}'}

django_token = None

# ── Helpers ───────────────────────────────────────────────────────
def log(msg, level='INFO'):
    colors = {'INFO': '\033[94m', 'OK': '\033[92m', 'WARN': '\033[93m', 'ERR': '\033[91m'}
    reset = '\033[0m'
    print(f"{colors.get(level, '')}{level}{reset}  {msg}")


def directus_get(endpoint, params=None):
    url = f"{DIRECTUS_URL}/items/{endpoint}"
    params = params or {}
    params['limit'] = params.get('limit', 1000)
    try:
        resp = requests.get(url, headers=HEADERS_DIRECTUS, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get('data', [])
    except Exception as e:
        log(f"Directus GET {endpoint} échoué: {e}", 'ERR')
        return []


def directus_get_file(file_id):
    """Télécharge un fichier depuis Directus."""
    url = f"{DIRECTUS_URL}/assets/{file_id}"
    try:
        resp = requests.get(url, headers=HEADERS_DIRECTUS, timeout=60, stream=True)
        resp.raise_for_status()
        content_type = resp.headers.get('Content-Type', 'image/jpeg')
        ext = content_type.split('/')[-1].split(';')[0]
        if ext in ['jpeg', 'jpg']:
            ext = 'jpg'
        return resp.content, ext
    except Exception as e:
        log(f"  Téléchargement fichier {file_id} échoué: {e}", 'WARN')
        return None, None


def django_login():
    global django_token
    try:
        resp = requests.post(
            f"{DJANGO_URL}/api/auth/token/",
            json={'username': DJANGO_EMAIL, 'password': DJANGO_PASSWORD},
            timeout=10
        )
        # try email login
        if resp.status_code != 200:
            # Django simplejwt uses username field, try extracting username part
            username = DJANGO_EMAIL.split('@')[0]
            resp = requests.post(
                f"{DJANGO_URL}/api/auth/token/",
                json={'username': username, 'password': DJANGO_PASSWORD},
                timeout=10
            )
        resp.raise_for_status()
        django_token = resp.json()['access']
        log(f"✅ Connecté à Django API ({DJANGO_URL})", 'OK')
        return True
    except Exception as e:
        log(f"Connexion Django échouée: {e}", 'ERR')
        log(f"Assurez-vous que Django tourne sur {DJANGO_URL} et que le compte admin existe.", 'WARN')
        return False


def django_headers():
    return {'Authorization': f'Bearer {django_token}'}


def django_post(endpoint, data):
    resp = requests.post(
        f"{DJANGO_URL}/api/v1/{endpoint}/",
        json=data,
        headers=django_headers(),
        timeout=30
    )
    return resp


def django_post_multipart(endpoint, data, files):
    resp = requests.post(
        f"{DJANGO_URL}/api/v1/{endpoint}/",
        data=data,
        files=files,
        headers=django_headers(),
        timeout=60
    )
    return resp


def upload_directus_image(file_id_or_name, folder='uploads'):
    """Télécharge une image depuis Directus et l'uploade vers Django."""
    if not file_id_or_name:
        return None

    # If it's a full URL or path, try to download directly
    if str(file_id_or_name).startswith('http'):
        try:
            resp = requests.get(file_id_or_name, timeout=30)
            resp.raise_for_status()
            content = resp.content
            ext = file_id_or_name.rsplit('.', 1)[-1][:4] or 'jpg'
        except:
            return None
    else:
        content, ext = directus_get_file(file_id_or_name)
        if not content:
            return None

    # Upload to Django media endpoint
    try:
        files = {'file': (f'{file_id_or_name}.{ext}', content, f'image/{ext}')}
        data = {'folder': folder}
        resp = requests.post(
            f"{DJANGO_URL}/api/v1/media/",
            data=data,
            files=files,
            headers=django_headers(),
            timeout=60
        )
        if resp.status_code == 201:
            return resp.json().get('path')
        log(f"  Upload image échoué: {resp.status_code} {resp.text[:100]}", 'WARN')
        return None
    except Exception as e:
        log(f"  Upload image exception: {e}", 'WARN')
        return None


# ── Migration Authors ─────────────────────────────────────────────
def migrate_authors():
    log("📚 Migration des auteurs...", 'INFO')
    authors_raw = directus_get('authors', {
        'fields': 'id,name,name_en,slug,bio_fr,bio_en,bio_ar,photo,country,is_author_of_month'
    })
    log(f"  {len(authors_raw)} auteurs trouvés dans Directus", 'INFO')

    created = 0
    skipped = 0
    id_map = {}  # directus_id → django_id

    for raw in authors_raw:
        name = raw.get('name', '').strip()
        if not name:
            skipped += 1
            continue

        slug = raw.get('slug', '') or name.lower().replace(' ', '-')

        # Handle photo
        photo_path = None
        photo_ref = raw.get('photo')
        if photo_ref:
            photo_id = photo_ref if isinstance(photo_ref, str) else photo_ref.get('id') if isinstance(photo_ref, dict) else None
            if photo_id:
                log(f"  📸 Téléchargement photo auteur: {photo_id}", 'INFO')
                photo_path = upload_directus_image(photo_id, 'authors')

        data = {
            'name': name,
            'name_en': raw.get('name_en', '') or '',
            'slug': slug,
            'bio_fr': raw.get('bio_fr', '') or '',
            'bio_en': raw.get('bio_en', '') or '',
            'bio_ar': raw.get('bio_ar', '') or '',
            'country': raw.get('country', '') or '',
            'is_author_of_month': raw.get('is_author_of_month', False) or False,
        }

        if photo_path:
            # Use multipart
            files = {}
            resp = django_post('authors', data)
        else:
            resp = django_post('authors', data)

        if resp.status_code in [200, 201]:
            django_id = resp.json().get('id')
            id_map[raw.get('id')] = django_id
            log(f"  ✅ Auteur créé: {name} (Directus #{raw.get('id')} → Django #{django_id})", 'OK')
            created += 1
        elif resp.status_code == 400 and 'slug' in resp.text:
            log(f"  ⚠️  Auteur déjà existant (slug): {name}", 'WARN')
            # Try to get the existing one
            existing = requests.get(
                f"{DJANGO_URL}/api/v1/authors/by-slug/{slug}/",
                headers=django_headers()
            )
            if existing.status_code == 200:
                id_map[raw.get('id')] = existing.json().get('id')
            skipped += 1
        else:
            log(f"  ❌ Échec auteur {name}: {resp.status_code} {resp.text[:200]}", 'ERR')
            skipped += 1

    log(f"  Auteurs: {created} créés, {skipped} ignorés", 'OK')
    return id_map


# ── Migration Books ──────────────────────────────────────────────
def migrate_books(author_id_map):
    log("📖 Migration des livres...", 'INFO')
    books_raw = directus_get('books', {
        'fields': 'id,title,title_en,title_ar,slug,author,author_name,description,description_en,description_ar,cover,price_dt,price_eur,year,pages,isbn,language,category,is_featured',
        'sort': 'id',
    })
    log(f"  {len(books_raw)} livres trouvés dans Directus", 'INFO')

    created = 0
    skipped = 0

    for raw in books_raw:
        title = raw.get('title', '').strip()
        if not title:
            skipped += 1
            continue

        slug = raw.get('slug', '') or title.lower().replace(' ', '-')

        # Map author
        author_ref = raw.get('author')
        django_author_id = None
        if author_ref:
            directus_author_id = author_ref if isinstance(author_ref, (int, str)) else author_ref.get('id') if isinstance(author_ref, dict) else None
            if directus_author_id:
                django_author_id = author_id_map.get(directus_author_id)

        data = {
            'title': title,
            'title_en': raw.get('title_en', '') or '',
            'title_ar': raw.get('title_ar', '') or '',
            'slug': slug,
            'author': django_author_id,
            'author_name': raw.get('author_name', '') or '',
            'description': raw.get('description', '') or '',
            'description_en': raw.get('description_en', '') or '',
            'description_ar': raw.get('description_ar', '') or '',
            'price_dt': str(raw.get('price_dt', 0) or 0),
            'price_eur': str(raw.get('price_eur', 0) or 0),
            'year': raw.get('year'),
            'pages': raw.get('pages'),
            'isbn': raw.get('isbn', '') or '',
            'language': raw.get('language', 'fr') or 'fr',
            'category': raw.get('category', '') or '',
            'is_featured': raw.get('is_featured', False) or False,
        }

        # Handle cover image
        cover_ref = raw.get('cover')
        cover_file = None
        if cover_ref:
            cover_id = cover_ref if isinstance(cover_ref, str) else cover_ref.get('id') if isinstance(cover_ref, dict) else None
            if cover_id:
                log(f"  📸 Téléchargement couverture: {title[:40]}", 'INFO')
                content, ext = directus_get_file(cover_id)
                if content:
                    cover_file = (f'{slug}.{ext}', content, f'image/{ext}')

        if cover_file:
            resp = requests.post(
                f"{DJANGO_URL}/api/v1/books/",
                data=data,
                files={'cover': cover_file},
                headers=django_headers(),
                timeout=60
            )
        else:
            resp = django_post('books', data)

        if resp.status_code in [200, 201]:
            log(f"  ✅ Livre créé: {title[:50]}", 'OK')
            created += 1
        elif resp.status_code == 400 and 'slug' in resp.text:
            log(f"  ⚠️  Livre déjà existant: {title[:40]}", 'WARN')
            skipped += 1
        else:
            log(f"  ❌ Échec livre {title[:40]}: {resp.status_code} {resp.text[:200]}", 'ERR')
            skipped += 1

        time.sleep(0.1)  # Avoid overwhelming the server

    log(f"  Livres: {created} créés, {skipped} ignorés", 'OK')


# ── Migration News ────────────────────────────────────────────────
def migrate_news():
    log("📰 Migration des actualités...", 'INFO')
    news_raw = directus_get('news', {
        'fields': 'id,title,title_en,title_ar,slug,content_fr,content_en,content_ar,image,date,author',
        'sort': 'id',
    })
    log(f"  {len(news_raw)} actualités trouvées dans Directus", 'INFO')

    created = 0
    skipped = 0

    for raw in news_raw:
        title = raw.get('title', '').strip()
        if not title:
            skipped += 1
            continue

        slug = raw.get('slug', '') or title.lower().replace(' ', '-')

        data = {
            'title': title,
            'title_en': raw.get('title_en', '') or '',
            'title_ar': raw.get('title_ar', '') or '',
            'slug': slug,
            'content_fr': raw.get('content_fr', '') or '',
            'content_en': raw.get('content_en', '') or '',
            'content_ar': raw.get('content_ar', '') or '',
            'date': raw.get('date'),
            'author': raw.get('author', '') or '',
        }

        image_ref = raw.get('image')
        image_file = None
        if image_ref:
            image_id = image_ref if isinstance(image_ref, str) else image_ref.get('id') if isinstance(image_ref, dict) else None
            if image_id:
                content, ext = directus_get_file(image_id)
                if content:
                    image_file = (f'{slug}.{ext}', content, f'image/{ext}')

        if image_file:
            resp = requests.post(
                f"{DJANGO_URL}/api/v1/news/",
                data=data,
                files={'image': image_file},
                headers=django_headers(),
                timeout=60
            )
        else:
            resp = django_post('news', data)

        if resp.status_code in [200, 201]:
            log(f"  ✅ Actualité créée: {title[:50]}", 'OK')
            created += 1
        elif resp.status_code == 400 and 'slug' in resp.text:
            log(f"  ⚠️  Actualité déjà existante: {title[:40]}", 'WARN')
            skipped += 1
        else:
            log(f"  ❌ Échec actualité {title[:40]}: {resp.status_code} {resp.text[:200]}", 'ERR')
            skipped += 1

        time.sleep(0.1)

    log(f"  Actualités: {created} créées, {skipped} ignorées", 'OK')


# ── Migration Press ───────────────────────────────────────────────
def migrate_press():
    log("📽️ Migration des articles presse...", 'INFO')
    press_raw = directus_get('press', {
        'fields': 'id,title,media_name,publication_date,excerpt,article_url,logo,featured,file_attachment',
        'sort': 'id',
    })
    log(f"  {len(press_raw)} articles presse trouvés dans Directus", 'INFO')

    created = 0
    skipped = 0

    for raw in press_raw:
        title = raw.get('title', '').strip()
        if not title:
            skipped += 1
            continue

        data = {
            'title': title,
            'media_name': raw.get('media_name', '') or '',
            'publication_date': raw.get('publication_date'),
            'excerpt': raw.get('excerpt', '') or '',
            'article_url': raw.get('article_url', '') or '',
            'featured': raw.get('featured', False) or False,
        }

        logo_ref = raw.get('logo')
        logo_file = None
        if logo_ref:
            logo_id = logo_ref if isinstance(logo_ref, str) else logo_ref.get('id') if isinstance(logo_ref, dict) else None
            if logo_id:
                content, ext = directus_get_file(logo_id)
                if content:
                    logo_file = (f'logo_{logo_id}.{ext}', content, f'image/{ext}')

        if logo_file:
            resp = requests.post(
                f"{DJANGO_URL}/api/v1/press/",
                data=data,
                files={'logo': logo_file},
                headers=django_headers(),
                timeout=60
            )
        else:
            resp = django_post('press', data)

        if resp.status_code in [200, 201]:
            log(f"  ✅ Presse créée: {title[:50]}", 'OK')
            created += 1
        else:
            log(f"  ❌ Échec presse {title[:40]}: {resp.status_code} {resp.text[:200]}", 'ERR')
            skipped += 1

        time.sleep(0.1)

    log(f"  Presse: {created} créés, {skipped} ignorés", 'OK')


# ── Migration Hero Sections ───────────────────────────────────────
def migrate_hero_sections():
    log("🖼️  Migration des sections hero...", 'INFO')
    heroes_raw = directus_get('hero_sections', {
        'fields': '*',
        'sort': 'order',
    })
    log(f"  {len(heroes_raw)} sections hero trouvées dans Directus", 'INFO')

    created = 0
    skipped = 0

    for raw in heroes_raw:
        data = {
            'title': raw.get('title', '') or '',
            'title_en': raw.get('title_en', '') or '',
            'title_ar': raw.get('title_ar', '') or '',
            'subtitle': raw.get('subtitle', '') or '',
            'subtitle_en': raw.get('subtitle_en', '') or '',
            'subtitle_ar': raw.get('subtitle_ar', '') or '',
            'description': raw.get('description', '') or '',
            'description_en': raw.get('description_en', '') or '',
            'description_ar': raw.get('description_ar', '') or '',
            'cta_label': raw.get('cta_label', '') or '',
            'cta_label_en': raw.get('cta_label_en', '') or '',
            'cta_label_ar': raw.get('cta_label_ar', '') or '',
            'cta_url': raw.get('cta_url', '') or '',
            'type': raw.get('type', 'main') or 'main',
            'order': raw.get('order', 0) or 0,
        }

        image_ref = raw.get('image')
        image_file = None
        if image_ref:
            image_id = image_ref if isinstance(image_ref, str) else image_ref.get('id') if isinstance(image_ref, dict) else None
            if image_id:
                content, ext = directus_get_file(image_id)
                if content:
                    image_file = (f'hero_{image_id}.{ext}', content, f'image/{ext}')

        if image_file:
            resp = requests.post(
                f"{DJANGO_URL}/api/v1/hero-sections/",
                data=data,
                files={'image': image_file},
                headers=django_headers(),
                timeout=60
            )
        else:
            resp = django_post('hero-sections', data)

        if resp.status_code in [200, 201]:
            log(f"  ✅ Hero créé: [{data['type']}] {data['title'][:40] or '(sans titre)'}", 'OK')
            created += 1
        else:
            log(f"  ❌ Échec hero: {resp.status_code} {resp.text[:200]}", 'ERR')
            skipped += 1

        time.sleep(0.1)

    log(f"  Hero sections: {created} créées, {skipped} ignorées", 'OK')


# ── Main ──────────────────────────────────────────────────────────
def main():
    print("\n" + "═" * 60)
    print("  🚀 Migration Directus → Django — Contraste Éditions")
    print("═" * 60 + "\n")

    log(f"Directus: {DIRECTUS_URL}", 'INFO')
    log(f"Django:   {DJANGO_URL}", 'INFO')
    print()

    # Test Directus connectivity
    try:
        resp = requests.get(f"{DIRECTUS_URL}/server/health", timeout=5)
        log(f"✅ Directus accessible ({resp.status_code})", 'OK')
    except Exception as e:
        log(f"⚠️  Directus inaccessible ({e}) — tentative de continuer...", 'WARN')

    # Login to Django
    if not django_login():
        sys.exit(1)

    print()

    # Run migrations in order
    author_id_map = migrate_authors()
    print()
    migrate_books(author_id_map)
    print()
    migrate_news()
    print()
    migrate_press()
    print()
    migrate_hero_sections()

    print()
    print("═" * 60)
    log("✅ Migration terminée !", 'OK')
    print("═" * 60 + "\n")


if __name__ == '__main__':
    main()

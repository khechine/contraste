# Guide de Migration : Directus ➔ Django Backend

Ce projet a été migré d'un backend Directus vers un backend **Django REST Framework** autonome.

## Architecture
- **Front-end :** Next.js (conservé, mis à jour pour Django).
- **Backend :** Django (dans `/backend/`).
- **Base de données :** PostgreSQL.
- **Authentification :** JWT (via SimpleJWT dans Django).

## Étapes de Migration

### 1. Préparer l'environnement
Copiez le fichier `.env` dans le dossier `backend/` et configurez vos variables (PostgreSQL, Secret Key).

### 2. Déployer avec Docker
```bash
docker-compose up -d --build
```
Cela lancera :
- Le service `postgres` (Base de données).
- Le service `backend` (Django sur le port 8000).
- Le service `app` (Next.js sur le port 3000).

### 3. Migrer les données (Script)
Une fois les services lancés et Django accessible, vous pouvez importer les données existantes de Directus :
```bash
cd backend
# Installez les dépendances si nécessaire (ou utilisez le container backend)
python migrate_from_directus.py
```
*Note : Le script va extraire les collections de Directus, télécharger les images et les ré-importer dans Django via l'API.*

### 4. Admin Interfaces
- **Admin Simplifiée (Next.js) :** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Super-Admin (Django) :** [http://localhost:8000/django-admin/](http://localhost:8000/django-admin/)

---

## Changements Majeurs
- Toutes les requêtes `lib/directus.ts` ont été remplacées par `lib/django.ts`.
- L'authentification utilise désormais `admin-django.ts` (JWT stocké en localStorage).
- Les fichiers chargés via Django sont accessibles via `/media/`.

## Maintenance
Le backend Django est hautement extensible via `/backend/api/models.py` et `/backend/api/admin.py`.

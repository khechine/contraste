#!/bin/bash
# =============================================================
# setup-directus-schema.sh — Initialisation du schema Directus
# Crée les collections books, authors, news, hero_sections
# Configure les permissions publiques
# Génère un static token admin permanent
#
# Usage : bash deploy/setup-directus-schema.sh
# =============================================================
set -e

ENV_FILE="/home/ubuntu/contraste/.env"
DIRECTUS_URL="http://localhost:8055"

# Charger les variables
source "$ENV_FILE"

echo "================================================"
echo " 📚 Initialisation Directus CMS — contraste.tn"
echo "================================================"

# --- Obtenir un token d'admin temporaire ---
echo ""
echo "🔑 Authentification admin Directus..."
LOGIN_RESPONSE=$(curl -sf -X POST "$DIRECTUS_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Impossible de s'authentifier. Vérifiez ADMIN_EMAIL et ADMIN_PASSWORD dans .env"
    exit 1
fi

echo "✅ Authentifié comme $ADMIN_EMAIL"

AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"

# -------------------------------------------------------
# Fonction utilitaire : créer une collection si elle n'existe pas
# -------------------------------------------------------
create_collection_if_missing() {
    local COLLECTION=$1
    local ICON=$2
    local NOTE=$3

    EXISTS=$(curl -sf -H "$AUTH_HEADER" "$DIRECTUS_URL/collections/$COLLECTION" 2>/dev/null | grep -c '"collection"' || true)
    if [ "$EXISTS" -gt 0 ]; then
        echo "  ✅ Collection $COLLECTION existe déjà"
        return
    fi

    echo "  📁 Création de la collection $COLLECTION..."
    curl -sf -X POST "$DIRECTUS_URL/collections" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d "{
            \"collection\": \"$COLLECTION\",
            \"meta\": {\"icon\": \"$ICON\", \"note\": \"$NOTE\"},
            \"schema\": {},
            \"fields\": [
                {
                    \"field\": \"id\",
                    \"type\": \"integer\",
                    \"meta\": {\"hidden\": true, \"readonly\": true, \"interface\": \"input\"},
                    \"schema\": {\"is_primary_key\": true, \"has_auto_increment\": true}
                },
                {
                    \"field\": \"status\",
                    \"type\": \"string\",
                    \"meta\": {\"interface\": \"select-dropdown\", \"options\": {\"choices\": [{\"text\": \"Publié\", \"value\": \"published\"}, {\"text\": \"Brouillon\", \"value\": \"draft\"}]}, \"default_value\": \"published\"},
                    \"schema\": {\"default_value\": \"published\"}
                },
                {
                    \"field\": \"date_created\",
                    \"type\": \"timestamp\",
                    \"meta\": {\"special\": [\"date-created\"], \"readonly\": true, \"hidden\": true}
                }
            ]
        }" > /dev/null
    echo "  ✅ Collection $COLLECTION créée"
}

# -------------------------------------------------------
# Fonction : ajouter un champ à une collection
# -------------------------------------------------------
add_field() {
    local COLLECTION=$1
    local FIELD=$2
    local TYPE=$3
    local META_JSON=$4
    local SCHEMA_JSON=$5

    EXISTS=$(curl -sf -H "$AUTH_HEADER" "$DIRECTUS_URL/fields/$COLLECTION/$FIELD" 2>/dev/null | grep -c '"field"' || true)
    if [ "$EXISTS" -gt 0 ]; then
        return
    fi

    curl -sf -X POST "$DIRECTUS_URL/fields/$COLLECTION" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d "{\"field\": \"$FIELD\", \"type\": \"$TYPE\", \"meta\": $META_JSON, \"schema\": $SCHEMA_JSON}" > /dev/null
}

# -------------------------------------------------------
# COLLECTION: authors
# -------------------------------------------------------
echo ""
echo "👤 Collection: authors"
create_collection_if_missing "authors" "person" "Auteurs des livres"

add_field "authors" "name"     "string"  '{"interface":"input","required":true,"width":"full","display":"raw"}' '{"is_nullable":false}'
add_field "authors" "slug"     "string"  '{"interface":"input","width":"half","note":"URL-friendly name"}' '{}'
add_field "authors" "bio"      "text"    '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "authors" "bio_en"   "text"    '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "authors" "bio_ar"   "text"    '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "authors" "photo"    "uuid"    '{"interface":"file-image","width":"half","display":"image"}' '{}'
add_field "authors" "country"  "string"  '{"interface":"input","width":"half"}' '{}'

echo "  ✅ Champs authors configurés"

# -------------------------------------------------------
# COLLECTION: books
# -------------------------------------------------------
echo ""
echo "📖 Collection: books"
create_collection_if_missing "books" "menu_book" "Livres publiés par Contraste Éditions"

add_field "books" "title"          "string"  '{"interface":"input","required":true,"width":"full"}' '{"is_nullable":false}'
add_field "books" "title_en"       "string"  '{"interface":"input","width":"half"}' '{}'
add_field "books" "title_ar"       "string"  '{"interface":"input","width":"half"}' '{}'
add_field "books" "slug"           "string"  '{"interface":"input","width":"half","note":"URL-friendly"}' '{}'
add_field "books" "author_name"    "string"  '{"interface":"input","width":"half","note":"Nom affiché"}' '{}'
add_field "books" "description"    "text"    '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "books" "description_en" "text"    '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "books" "description_ar" "text"    '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "books" "cover_image"    "uuid"    '{"interface":"file-image","width":"half","display":"image"}' '{}'
add_field "books" "price_dt"       "decimal" '{"interface":"input","width":"quarter"}' '{"numeric_precision":10,"numeric_scale":2}'
add_field "books" "price_eur"      "decimal" '{"interface":"input","width":"quarter"}' '{"numeric_precision":10,"numeric_scale":2}'
add_field "books" "year"           "integer" '{"interface":"input","width":"quarter"}' '{}'
add_field "books" "pages"          "integer" '{"interface":"input","width":"quarter"}' '{}'
add_field "books" "isbn"           "string"  '{"interface":"input","width":"half"}' '{}'
add_field "books" "language"       "string"  '{"interface":"input","width":"half"}' '{}'
add_field "books" "category"       "string"  '{"interface":"input","width":"full"}' '{}'

echo "  ✅ Champs books configurés"

# -------------------------------------------------------
# COLLECTION: news (actualités)
# -------------------------------------------------------
echo ""
echo "📰 Collection: news"
create_collection_if_missing "news" "newspaper" "Actualités de la maison d'édition"

add_field "news" "title"      "string"    '{"interface":"input","required":true,"width":"full"}' '{"is_nullable":false}'
add_field "news" "title_en"   "string"    '{"interface":"input","width":"half"}' '{}'
add_field "news" "title_ar"   "string"    '{"interface":"input","width":"half"}' '{}'
add_field "news" "slug"       "string"    '{"interface":"input","width":"half"}' '{}'
add_field "news" "content"    "text"      '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "news" "content_en" "text"      '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "news" "content_ar" "text"      '{"interface":"input-rich-text-html","width":"full"}' '{}'
add_field "news" "excerpt"    "text"      '{"interface":"input-multiline","width":"full"}' '{}'
add_field "news" "image"      "uuid"      '{"interface":"file-image","width":"half","display":"image"}' '{}'
add_field "news" "date"       "timestamp" '{"interface":"datetime","width":"half","display":"datetime"}' '{}'
add_field "news" "author"     "string"    '{"interface":"input","width":"half"}' '{}'

echo "  ✅ Champs news configurés"

# -------------------------------------------------------
# COLLECTION: hero_sections
# -------------------------------------------------------
echo ""
echo "🏠 Collection: hero_sections"
create_collection_if_missing "hero_sections" "home" "Sections héroïques de la page d'accueil"

add_field "hero_sections" "title"       "string"  '{"interface":"input","width":"full"}' '{}'
add_field "hero_sections" "title_en"    "string"  '{"interface":"input","width":"half"}' '{}'
add_field "hero_sections" "title_ar"    "string"  '{"interface":"input","width":"half"}' '{}'
add_field "hero_sections" "subtitle"    "string"  '{"interface":"input","width":"full"}' '{}'
add_field "hero_sections" "subtitle_en" "string"  '{"interface":"input","width":"half"}' '{}'
add_field "hero_sections" "subtitle_ar" "string"  '{"interface":"input","width":"half"}' '{}'
add_field "hero_sections" "description" "text"    '{"interface":"input-multiline","width":"full"}' '{}'
add_field "hero_sections" "cta_label"   "string"  '{"interface":"input","width":"half"}' '{}'
add_field "hero_sections" "cta_url"     "string"  '{"interface":"input","width":"half"}' '{}'
add_field "hero_sections" "image"       "uuid"    '{"interface":"file-image","width":"half","display":"image"}' '{}'
add_field "hero_sections" "type"        "string"  '{"interface":"input","width":"half"}' '{}'
add_field "hero_sections" "order"       "integer" '{"interface":"input","width":"half"}' '{}'

echo "  ✅ Champs hero_sections configurés"

# -------------------------------------------------------
# PERMISSIONS PUBLIQUES (lecture seule pour toutes collections)
# -------------------------------------------------------
echo ""
echo "🔓 Configuration des permissions publiques (lecture)..."

for COLLECTION in books authors news hero_sections; do
    # Vérifier si permission publique existe
    PERM_EXISTS=$(curl -sf -H "$AUTH_HEADER" \
        "$DIRECTUS_URL/permissions?filter[collection][_eq]=$COLLECTION&filter[role][_null]=true&filter[action][_eq]=read" \
        2>/dev/null | grep -c '"id"' || true)

    if [ "$PERM_EXISTS" -gt 0 ]; then
        echo "  ✅ Permission publique $COLLECTION déjà configurée"
    else
        curl -sf -X POST "$DIRECTUS_URL/permissions" \
            -H "$AUTH_HEADER" \
            -H "Content-Type: application/json" \
            -d "{
                \"role\": null,
                \"collection\": \"$COLLECTION\",
                \"action\": \"read\",
                \"fields\": [\"*\"],
                \"permissions\": {},
                \"validation\": {}
            }" > /dev/null
        echo "  ✅ Permission publique créée pour $COLLECTION"
    fi
done

# Permissions fichiers (directus_files) pour les images
PERM_FILES=$(curl -sf -H "$AUTH_HEADER" \
    "$DIRECTUS_URL/permissions?filter[collection][_eq]=directus_files&filter[role][_null]=true&filter[action][_eq]=read" \
    2>/dev/null | grep -c '"id"' || true)

if [ "$PERM_FILES" -eq 0 ]; then
    curl -sf -X POST "$DIRECTUS_URL/permissions" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d '{"role": null, "collection": "directus_files", "action": "read", "fields": ["*"], "permissions": {}, "validation": {}}' > /dev/null
    echo "  ✅ Permission publique directus_files créée"
fi

# -------------------------------------------------------
# CRÉER UN STATIC TOKEN PERMANENT
# -------------------------------------------------------
echo ""
echo "🔑 Création d'un static token permanent pour l'admin..."

ADMIN_USER=$(curl -sf -H "$AUTH_HEADER" \
    "$DIRECTUS_URL/users?filter[email][_eq]=$ADMIN_EMAIL" \
    | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ADMIN_USER" ]; then
    echo "❌ Impossible de trouver l'utilisateur admin"
else
    STATIC_TOKEN=$(openssl rand -hex 32)

    curl -sf -X PATCH "$DIRECTUS_URL/users/$ADMIN_USER" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d "{\"token\": \"$STATIC_TOKEN\"}" > /dev/null

    echo ""
    echo "================================================"
    echo " ✅ Schema Directus initialisé avec succès !"
    echo "================================================"
    echo ""
    echo "⚠️  IMPORTANT — Copiez ce static token dans votre .env :"
    echo ""
    echo "   DIRECTUS_TOKEN=$STATIC_TOKEN"
    echo ""
    echo "   Puis relancez : docker compose up -d app"
    echo ""
    echo "📝 Mettez aussi à jour le .env local de développement"
fi

echo "🌐 Admin CMS : https://directus.contraste.tn/admin"

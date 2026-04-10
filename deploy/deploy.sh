#!/bin/bash
# =============================================================
# deploy.sh — Déploiement répétable de contraste.tn
# Exécuter sur le VPS : cd /home/ubuntu/contraste && bash deploy/deploy.sh
# =============================================================
set -e

APP_DIR="/home/ubuntu/contraste"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"
ENV_FILE="$APP_DIR/.env"

echo "================================================"
echo " 🚀 Déploiement contraste.tn"
echo "================================================"

# --- Vérifier que le .env existe ---
if [ ! -f "$ENV_FILE" ]; then
    echo ""
    echo "❌ ERREUR : Fichier .env manquant !"
    echo "   Créez-le avec : cp .env.production.example .env"
    echo "   Puis remplissez les valeurs avec : nano .env"
    exit 1
fi

# --- Vérifier les variables obligatoires ---
source "$ENV_FILE"

check_var() {
    if [ -z "${!1}" ] || [[ "${!1}" == *"CHANGEZ_MOI"* ]] || [[ "${!1}" == *"GENEREZ"* ]] || [[ "${!1}" == *"VOTRE"* ]]; then
        echo "❌ Variable $1 non définie ou non modifiée dans .env"
        exit 1
    fi
}

check_var "DB_PASSWORD"
check_var "DIRECTUS_SECRET"
check_var "DIRECTUS_KEY"
check_var "ADMIN_PASSWORD"

echo "✅ Variables d'environnement OK"

# --- Pull dernière version du code ---
echo ""
echo "📥 Pull du code depuis GitHub..."
cd "$APP_DIR"
git pull origin main
echo "✅ Code à jour"

# --- Arrêter l'app Next.js (pas Directus/DB pour éviter la perte de données) ---
echo ""
echo "⏹️  Arrêt du service app..."
docker compose stop app 2>/dev/null || true

# --- Build et démarrage de tous les services ---
echo ""
echo "🔨 Build et démarrage des containers..."
docker compose --env-file "$ENV_FILE" up -d --build

echo ""
echo "⏳ Attente que Directus soit prêt..."
MAX_WAIT=120
WAITED=0
until curl -sf http://localhost:8055/server/health > /dev/null 2>&1; do
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "❌ Directus ne répond pas après ${MAX_WAIT}s"
        docker compose logs directus --tail=50
        exit 1
    fi
    echo "   ... attente (${WAITED}s)"
    sleep 5
    WAITED=$((WAITED + 5))
done
echo "✅ Directus est prêt !"

# --- Nettoyage des images Docker orphelines ---
echo ""
echo "🧹 Nettoyage des anciennes images..."
docker image prune -f 2>/dev/null || true

# --- Statut final ---
echo ""
echo "================================================"
echo " ✅ Déploiement terminé !"
echo "================================================"
echo ""
docker compose ps
echo ""
echo "🌐 Site : https://www.contraste.tn"
echo "🔧 CMS  : https://directus.contraste.tn/admin"
echo ""
echo "👉 Si c'est le premier déploiement :"
echo "   bash deploy/setup-directus-schema.sh"

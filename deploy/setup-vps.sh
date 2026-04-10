#!/bin/bash
# =============================================================
# setup-vps.sh — Installation initiale sur VPS Ubuntu (1x)
# Exécuter en tant que : ubuntu@vps805749.ovh.net
# Usage : bash deploy/setup-vps.sh
# =============================================================
set -e

DOMAIN="www.contraste.tn"
DIRECTUS_DOMAIN="directus.contraste.tn"
APP_DIR="/home/ubuntu/contraste"
REPO_URL="https://github.com/khechine/contraste.git"

echo "================================================"
echo " 🚀 Setup VPS — contraste.tn"
echo "================================================"

# --- Mise à jour système ---
echo "📦 Mise à jour des paquets..."
sudo apt-get update -y && sudo apt-get upgrade -y

# --- Docker ---
if ! command -v docker &> /dev/null; then
    echo "🐳 Installation de Docker..."
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker ubuntu
    echo "✅ Docker installé"
else
    echo "✅ Docker déjà présent : $(docker --version)"
fi

# --- Docker Compose (plugin v2) ---
if ! docker compose version &> /dev/null; then
    echo "🐳 Installation de Docker Compose plugin..."
    sudo apt-get install -y docker-compose-plugin
    echo "✅ Docker Compose installé"
else
    echo "✅ Docker Compose déjà présent : $(docker compose version)"
fi

# --- Nginx ---
if ! command -v nginx &> /dev/null; then
    echo "🌐 Installation de Nginx..."
    sudo apt-get install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo "✅ Nginx installé"
else
    echo "✅ Nginx déjà présent"
fi

# --- Certbot (Let's Encrypt) ---
if ! command -v certbot &> /dev/null; then
    echo "🔒 Installation de Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx
    echo "✅ Certbot installé"
else
    echo "✅ Certbot déjà présent"
fi

# --- Git ---
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
fi

# --- Cloner le repo ---
if [ ! -d "$APP_DIR" ]; then
    echo ""
    echo "📁 Clonage du repo dans $APP_DIR..."
    git clone "$REPO_URL" "$APP_DIR"
    echo "✅ Repo cloné"
else
    echo "✅ Dossier $APP_DIR existe déjà"
fi

# --- Créer dossier certbot challenge ---
sudo mkdir -p /var/www/certbot

# --- Copier config Nginx temporaire (HTTP seulement) pour Certbot ---
echo ""
echo "🌐 Configuration Nginx pour le challenge SSL..."
sudo tee /etc/nginx/sites-available/contraste > /dev/null <<'NGINX_HTTP'
server {
    listen 80;
    server_name contraste.tn www.contraste.tn directus.contraste.tn;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'OK - SSL en cours de configuration';
        add_header Content-Type text/plain;
    }
}
NGINX_HTTP

sudo ln -sf /etc/nginx/sites-available/contraste /etc/nginx/sites-enabled/contraste
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configuré (HTTP provisoire)"

# --- Obtenir les certificats SSL ---
echo ""
echo "🔒 Obtention des certificats SSL Let's Encrypt..."

# Certificat pour www.contraste.tn + contraste.tn
if [ ! -d "/etc/letsencrypt/live/www.contraste.tn" ]; then
    sudo certbot certonly --nginx \
        -d contraste.tn \
        -d www.contraste.tn \
        --non-interactive \
        --agree-tos \
        --email admin@contraste.tn \
        --redirect
    echo "✅ Certificat www.contraste.tn obtenu"
else
    echo "✅ Certificat www.contraste.tn déjà présent"
fi

# Certificat pour directus.contraste.tn
if [ ! -d "/etc/letsencrypt/live/directus.contraste.tn" ]; then
    sudo certbot certonly --nginx \
        -d directus.contraste.tn \
        --non-interactive \
        --agree-tos \
        --email admin@contraste.tn
    echo "✅ Certificat directus.contraste.tn obtenu"
else
    echo "✅ Certificat directus.contraste.tn déjà présent"
fi

# --- Copier la config Nginx finale ---
echo ""
echo "🌐 Déploiement de la configuration Nginx finale (HTTPS)..."
sudo cp "$APP_DIR/deploy/nginx/contraste.conf" /etc/nginx/sites-available/contraste
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configuré (HTTPS + SSL)"

# --- Renouvellement SSL automatique ---
echo ""
echo "🔄 Activation du renouvellement automatique SSL..."
(sudo crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | sudo crontab -
echo "✅ Cron SSL configuré"

echo ""
echo "================================================"
echo " ✅ Setup VPS terminé !"
echo "================================================"
echo ""
echo "👉 Prochaine étape : cd $APP_DIR && bash deploy/deploy.sh"
echo ""
echo "⚠️  N'oubliez pas de créer le fichier .env :"
echo "   cp .env.production.example .env"
echo "   nano .env  # Remplir les vraies valeurs"

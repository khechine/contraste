#!/bin/bash
echo "🧹 Nettoyage du cache Next.js..."
rm -rf .next/cache
echo "✨ Cache nettoyé."
echo ""
echo "🚀 Pour redémarrer proprement votre application :"
echo "1. Arrêtez votre terminal actuel (Ctrl+C)"
echo "2. Lancez : npm run dev"

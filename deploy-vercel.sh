#!/bin/bash

# Script de déploiement Vercel pour yaya.ia
# Ce script guide l'utilisateur à travers le processus de déploiement

echo "🚀 Déploiement de yaya.ia sur Vercel"
echo "===================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis la racine du projet"
    exit 1
fi

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "📦 Installation..."
    npm install -g vercel
fi

echo "✅ Vercel CLI trouvé"
echo ""

# Vérifier le fichier .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Erreur: Fichier .env.local introuvable"
    echo "📝 Copiez .env.example vers .env.local et configurez vos clés"
    exit 1
fi

echo "✅ Fichier .env.local trouvé"
echo ""

echo "📋 Prochaines étapes :"
echo ""
echo "1. Authentification Vercel"
echo "   -> Une page web va s'ouvrir"
echo "   -> Connectez-vous avec votre compte GitHub"
echo ""
echo "2. Configuration du projet"
echo "   -> Choisissez votre scope/équipe"
echo "   -> Acceptez les paramètres par défaut"
echo ""
echo "3. Variables d'environnement"
echo "   -> Elles seront configurées après le premier déploiement"
echo ""

read -p "Appuyez sur ENTER pour continuer..."

# Authentification
echo ""
echo "🔐 Authentification Vercel..."
echo ""
vercel login

# Vérifier si l'authentification a réussi
if [ $? -ne 0 ]; then
    echo "❌ Échec de l'authentification"
    exit 1
fi

echo ""
echo "✅ Authentification réussie"
echo ""

# Premier déploiement
echo "🚀 Déploiement en production..."
echo ""
vercel --prod --yes

# Vérifier le résultat
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DÉPLOIEMENT RÉUSSI !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo ""
    echo "1. Notez l'URL de production affichée ci-dessus"
    echo ""
    echo "2. Configurez les variables d'environnement dans Vercel :"
    echo "   https://vercel.com/dashboard"
    echo "   -> Sélectionnez votre projet 'yaya-ia'"
    echo "   -> Settings > Environment Variables"
    echo "   -> Copiez les valeurs depuis votre .env.local"
    echo ""
    echo "3. Redéployez pour prendre en compte les variables :"
    echo "   vercel --prod"
    echo ""
    echo "4. Configurez Supabase avec l'URL de production"
    echo "   -> Voir DEPLOYMENT_GUIDE.md"
    echo ""
else
    echo ""
    echo "❌ Échec du déploiement"
    echo ""
    echo "💡 Solutions :"
    echo "   - Vérifiez vos logs dans le dashboard Vercel"
    echo "   - Assurez-vous que toutes les dépendances sont installées"
    echo "   - Vérifiez qu'il n'y a pas d'erreurs TypeScript (npm run build)"
    echo ""
    exit 1
fi

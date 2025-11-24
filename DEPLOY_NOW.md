# 🚀 Déployer yaya.ia MAINTENANT en 5 minutes

## ✅ Ce qui est fait

Le code est **prêt pour la production** et poussé sur GitHub :
- **Repository**: https://github.com/Alexisl94/yaya-ia
- **Branch**: master
- **Dernier commit**: Documentation et système de paiement complet

## 🎯 Option 1 : Déploiement via l'interface Vercel (RECOMMANDÉ - 5 min)

### Étape 1 : Aller sur Vercel (1 min)

1. Ouvrir https://vercel.com dans votre navigateur
2. Se connecter avec votre compte GitHub
3. Autoriser Vercel à accéder à vos repositories

### Étape 2 : Importer le projet (30 sec)

1. Cliquer sur **"Add New..."** → **"Project"**
2. Chercher et sélectionner **`yaya-ia`** dans la liste
3. Cliquer sur **"Import"**

### Étape 3 : Configurer le projet (2 min)

**Paramètres (automatiquement détectés) :**
- Framework Preset: **Next.js** ✅
- Root Directory: `./` ✅
- Build Command: `next build` ✅
- Output Directory: `.next` ✅

**Variables d'environnement à ajouter :**

Cliquer sur **"Environment Variables"** et ajouter ces variables **UNE PAR UNE** :

```bash
# Supabase (OBLIGATOIRE)
# Copier depuis votre fichier .env.local
NEXT_PUBLIC_SUPABASE_URL=votre_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_supabase_service_role_key

# Anthropic API (OBLIGATOIRE)
# Copier depuis votre fichier .env.local
ANTHROPIC_API_KEY=votre_anthropic_api_key

# OpenAI API (OBLIGATOIRE)
# Copier depuis votre fichier .env.local
OPENAI_API_KEY=votre_openai_api_key

# SerpAPI (OBLIGATOIRE pour recherche web)
# Copier depuis votre fichier .env.local
SERPAPI_API_KEY=votre_serpapi_key

# Application (OBLIGATOIRE)
NODE_ENV=production

# Stripe (OPTIONNEL - peut être configuré plus tard)
# Pour l'instant, laisser les placeholders
STRIPE_SECRET_KEY=sk_test_placeholder_changeme
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder_changeme
STRIPE_WEBHOOK_SECRET=whsec_placeholder_changeme
STRIPE_PRICE_PRO_MONTHLY=price_placeholder_pro_monthly
STRIPE_PRICE_PRO_YEARLY=price_placeholder_pro_yearly
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_placeholder_enterprise_monthly
STRIPE_PRICE_ENTERPRISE_YEARLY=price_placeholder_enterprise_yearly
```

**Note importante** : Pour `NEXT_PUBLIC_APP_URL`, attendez d'avoir l'URL Vercel et revenez l'ajouter après le déploiement.

### Étape 4 : Déployer (1 min)

1. Vérifier que toutes les variables sont ajoutées
2. Cliquer sur **"Deploy"**
3. Attendre 2-3 minutes pendant le build
4. ✅ Votre app est en ligne !

### Étape 5 : Configuration post-déploiement (1 min)

Une fois déployé, vous obtiendrez une URL du type : `https://yaya-ia-xxxxx.vercel.app`

**Ajouter l'URL dans Vercel :**
1. Aller dans **Settings** → **Environment Variables**
2. Ajouter : `NEXT_PUBLIC_APP_URL=https://votre-url.vercel.app`
3. Redéployer (Deployments → trois points → Redeploy)

**Configurer Supabase :**
1. Aller sur https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz
2. **Authentication** → **URL Configuration**
3. Ajouter :
   - **Site URL**: `https://votre-url.vercel.app`
   - **Redirect URLs**: `https://votre-url.vercel.app/auth/callback`
4. Sauvegarder

---

## 🎯 Option 2 : Déploiement via CLI (pour les développeurs)

```bash
# 1. Ouvrir le navigateur pour s'authentifier
vercel login

# 2. Déployer
vercel --prod

# 3. Suivre les prompts et c'est fait !
```

---

## 🧪 Tester votre déploiement

Une fois déployé, testez ces fonctionnalités :

### ✅ Checklist de base
1. [ ] La page d'accueil se charge
2. [ ] L'inscription fonctionne
3. [ ] La connexion fonctionne
4. [ ] Créer un agent fonctionne
5. [ ] Le chat fonctionne
6. [ ] Les Doggos sont comptabilisés

### ✅ Checklist Stripe (plus tard)
1. [ ] Les plans s'affichent dans Settings
2. [ ] Le clic sur "Passer au Pro" affiche un message (Stripe pas configuré)
3. [ ] Voir le guide STRIPE_SETUP.md pour activer les paiements

---

## 🎉 C'est terminé !

Votre application est maintenant **EN LIGNE** et accessible au monde entier !

**Prochaines étapes :**

1. **Tester l'application** avec de vrais utilisateurs
2. **Configurer Stripe** si vous voulez activer les paiements (voir STRIPE_SETUP.md)
3. **Ajouter un domaine personnalisé** dans Vercel → Settings → Domains
4. **Monitorer les logs** dans Vercel Dashboard

---

## 📞 Besoin d'aide ?

- 📖 Voir le guide complet : [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 💳 Configurer Stripe : [STRIPE_SETUP.md](./STRIPE_SETUP.md)
- 🐛 Issues GitHub : https://github.com/Alexisl94/yaya-ia/issues

---

**URL GitHub** : https://github.com/Alexisl94/yaya-ia
**Serveur local** : http://localhost:3000 (actuellement en cours d'exécution)

🚀 **Let's ship it!**

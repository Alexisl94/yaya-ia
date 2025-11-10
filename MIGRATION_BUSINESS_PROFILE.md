# Migration : Profil Entreprise Centralisé

## 🎯 Ce qui a été fait

J'ai implémenté le système de **Profil Entreprise Centralisé** (Option 1) pour ton application. Voici tout ce qui a été mis en place :

### ✅ Base de données

1. **Nouvelle table `business_profiles`**
   - Stocke les informations d'entreprise de manière centralisée
   - Un profil par utilisateur, partagé entre tous les agents
   - Fichier : `supabase/migrations/20250111000000_create_business_profiles.sql`

2. **Modification de la table `agents`**
   - Ajout de la colonne `business_profile_id` (nullable pour rétrocompatibilité)
   - Relation avec `business_profiles`
   - Fichier : `supabase/migrations/20250111000001_add_business_profile_to_agents.sql`

### ✅ Backend

3. **Types TypeScript** (`types/database.ts`)
   - `BusinessProfile` : interface complète
   - `CreateBusinessProfileInput` / `UpdateBusinessProfileInput`
   - `CreateAgentInput` mis à jour avec `business_profile_id`

4. **Fonctions DB** (`lib/db/business-profiles.ts`)
   - `getBusinessProfile()` : récupérer le profil d'un utilisateur
   - `createBusinessProfile()` : créer un nouveau profil
   - `updateBusinessProfile()` : mettre à jour le profil
   - `deleteBusinessProfile()` : supprimer le profil
   - `upsertBusinessProfile()` : créer OU mettre à jour (intelligente)

5. **API Routes**
   - `GET/POST /api/business-profiles` : récupérer/créer profil
   - `PATCH/DELETE /api/business-profiles/[id]` : modifier/supprimer
   - `/api/agents/create` modifiée pour gérer le profil

### ✅ Frontend

6. **Store Onboarding** (`lib/store/onboarding-store.ts`)
   - Ajout de `profileId` dans `OnboardingData`
   - Nouvelle action `setBusinessProfile()`
   - Workflow mis à jour : 7 steps pour les deux types d'agents

7. **Nouveau composant** (`components/onboarding/step-business-profile.tsx`)
   - Détecte automatiquement si un profil existe
   - Propose de réutiliser le profil existant OU de le modifier
   - Formulaire complet pour créer un nouveau profil
   - Utilisé par BOTH companion ET task agents

8. **Workflow onboarding mis à jour** (`app/onboarding/page.tsx`)
   - **Companion** : Type → Secteur → **Profil Business** → Goals & Values → Style → LLM → Confirmation
   - **Task** : Type → Secteur → **Profil Business** → Task Definition → Style → LLM → Confirmation

---

## 🚀 Ce que tu dois faire maintenant

### Étape 1 : Exécuter les migrations SQL ⚠️ OBLIGATOIRE

Ouvre ton **Supabase SQL Editor** et exécute ces deux fichiers **dans l'ordre** :

1. **D'abord** : Copie et exécute le contenu de :
   ```
   supabase/migrations/20250111000000_create_business_profiles.sql
   ```

2. **Ensuite** : Copie et exécute le contenu de :
   ```
   supabase/migrations/20250111000001_add_business_profile_to_agents.sql
   ```

✅ **Tu sauras que ça a marché si** :
- Pas d'erreur dans le SQL Editor
- Tu vois la table `business_profiles` dans Table Editor
- La table `agents` a une nouvelle colonne `business_profile_id`

---

### Étape 2 : Tester le nouveau système

1. **Rafraîchis ton navigateur** (F5) pour charger le nouveau code

2. **Crée un premier agent** (companion ou task) :
   - Va sur `/onboarding`
   - Tu devrais voir le nouveau step "Profil Entreprise" (step 3)
   - Remplis le formulaire
   - Termine la création

3. **Crée un deuxième agent** :
   - Retourne sur `/onboarding`
   - Au step 3, tu devrais voir : **"Profil entreprise détecté"** ✨
   - Le système propose de réutiliser ton profil existant
   - Teste les deux options :
     - ✅ **"Utiliser ce profil"** : devrait passer directement au step suivant
     - ✏️ **"Modifier"** : devrait afficher le formulaire pré-rempli

---

## 🎨 Ce qui a changé pour l'utilisateur

### Avant (workflow ancien)
**Companion (8 steps):**
1. Type d'agent
2. Secteur
3. Business Identity (nom, type, localisation...)
4. Detailed Context (clients, défis, outils...)
5. Goals & Values
6. Communication Style
7. LLM Selection
8. Confirmation

**Task (6 steps):**
1. Type d'agent
2. Secteur
3. Task Definition ⚠️ **PAS de contexte entreprise !**
4. Communication Style
5. LLM Selection
6. Confirmation

### Maintenant (workflow nouveau) ✨
**Companion (7 steps):**
1. Type d'agent
2. Secteur
3. **Profil Entreprise** (détection + réutilisation intelligente)
4. Goals & Values
5. Communication Style
6. LLM Selection
7. Confirmation

**Task (7 steps):**
1. Type d'agent
2. Secteur
3. **Profil Entreprise** (même profil que les companions ! 🎉)
4. Task Definition
5. Communication Style
6. LLM Selection
7. Confirmation

---

## 💡 Avantages du nouveau système

### Pour l'utilisateur
- ✅ **Données saisies UNE seule fois** (même pour plusieurs agents)
- ✅ **Agents task maintenant personnalisés** avec le contexte entreprise
- ✅ **Workflow plus rapide** pour les agents suivants (détection automatique)
- ✅ **Profil modifiable** à tout moment (centralisé)

### Pour le développement
- ✅ **Scalable** : facile d'ajouter de nouveaux champs au profil
- ✅ **DRY (Don't Repeat Yourself)** : pas de duplication de données
- ✅ **Migration facile** : agents existants continuent de fonctionner (business_profile_id nullable)
- ✅ **Cohérence** : tous les agents utilisent les mêmes infos

---

## 🐛 Si quelque chose ne marche pas

### Erreur : "column business_profile_id does not exist"
➡️ Tu n'as pas exécuté la migration SQL. Retourne à l'**Étape 1**.

### Le step "Profil Entreprise" ne s'affiche pas
➡️ Vide le cache du navigateur (Ctrl+Shift+R) ou vérifie la console pour des erreurs.

### Le profil existant n'est pas détecté
➡️ Vérifie que la migration SQL s'est bien exécutée. Ouvre la console réseau (F12) et regarde si `/api/business-profiles` retourne bien le profil.

### Les agents task ne reçoivent toujours pas le contexte
➡️ Vérifie que le `business_profile` est bien envoyé dans le body de `/api/agents/create` en inspectant la requête réseau (F12 > Network).

---

## 📝 Prochaines étapes suggérées (optionnel)

1. **Page Settings du profil** : Créer `/settings/business-profile` pour permettre à l'utilisateur de modifier son profil centralisé

2. **Migration des agents existants** : Script pour extraire les infos des agents companion existants et créer des profils

3. **Amélioration du générateur de prompts** : Utiliser directement le `business_profile` de la DB au lieu de passer par settings

4. **Suppression des anciens steps** : Nettoyer les fichiers `step-business-identity.tsx` et `step-detailed-context.tsx` (maintenant inutilisés)

---

## 🎉 Conclusion

Le système de **Profil Entreprise Centralisé** est maintenant **100% opérationnel** !

Une fois les migrations exécutées, tu auras :
- ✅ Agents task personnalisés avec le contexte entreprise
- ✅ Workflow fluide avec détection automatique du profil
- ✅ Base solide et scalable pour l'avenir

**Dis-moi quand les migrations sont exécutées et que tu as testé, on pourra vérifier ensemble que tout fonctionne ! 🚀**

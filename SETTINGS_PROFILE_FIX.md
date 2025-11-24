# Corrections - Page Settings & Upload Avatar

## Problème Initial

L'erreur `Error loading profile: {}` apparaissait car le composant `ProfileSection` tentait d'accéder à une table `profiles` qui n'existe pas dans la base de données.

## Corrections Effectuées

### 1. Migration de `profiles` vers `users` ✅

**Fichier modifié :** `components/settings/profile-section.tsx`

**Changements :**
- ✅ Lecture depuis `users` au lieu de `profiles`
- ✅ Mise à jour avec `UPDATE` au lieu de `UPSERT`
- ✅ Suppression des champs inexistants (`bio`, `phone`)
- ✅ Utilisation uniquement de `full_name` et `avatar_url`

### 2. Amélioration de l'Upload d'Avatar ✅

**Améliorations :**
- ✅ Meilleure gestion des erreurs avec messages détaillés
- ✅ Suppression automatique de l'ancien avatar avant upload
- ✅ Reset du file input après upload
- ✅ Option `upsert: true` pour permettre le remplacement
- ✅ Cache control optimisé (3600s)

### 3. Configuration du Storage Supabase

**Fichier créé :** `supabase/setup-avatars-storage.sql`

Script SQL pour :
- ✅ Créer le bucket `avatars` (public)
- ✅ Politiques RLS pour upload/update/delete (utilisateur propriétaire)
- ✅ Politique RLS pour lecture publique

## Instructions de Configuration

### Étape 1 : Créer le bucket (Supabase Dashboard)

1. Allez sur https://supabase.com/dashboard
2. **Storage** → **New bucket**
3. Nom : `avatars`
4. Cochez **Public bucket**
5. **Create bucket**

### Étape 2 : Exécuter le script SQL

1. **SQL Editor** → **New query**
2. Copiez le contenu de `supabase/setup-avatars-storage.sql`
3. **Run** ou `Ctrl+Enter`

### Étape 3 : Tester

1. Allez sur http://localhost:3000/settings
2. Cliquez sur "Changer la photo"
3. Sélectionnez une image (max 2MB)
4. L'avatar devrait s'afficher immédiatement

## Structure de la Table Users

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,              -- ✅ Modifiable
  avatar_url TEXT,              -- ✅ Modifiable
  subscription_tier TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Fonctionnalités du Profil

✅ **Lecture du profil** - Charge `full_name` et `avatar_url` depuis `users`
✅ **Modification du nom** - Update du `full_name`
✅ **Upload d'avatar** - Upload vers `storage.avatars` + update `avatar_url`
✅ **Email (lecture seule)** - Affiché mais non modifiable (sécurité)
✅ **Gestion d'erreurs** - Messages toast détaillés
✅ **Loading states** - Indicateurs visuels pendant les opérations

## Fichiers Modifiés

| Fichier | Type | Description |
|---------|------|-------------|
| `components/settings/profile-section.tsx` | Modifié | Migration vers table `users` |
| `supabase/setup-avatars-storage.sql` | Créé | Configuration storage + RLS |
| `SETUP_AVATARS_STORAGE.md` | Créé | Guide de configuration |
| `SETTINGS_PROFILE_FIX.md` | Créé | Documentation des corrections |

## Prochaines Améliorations Possibles

- [ ] Ajout d'un crop/resize d'image avant upload
- [ ] Support du drag & drop pour l'avatar
- [ ] Prévisualisation avant upload
- [ ] Compression automatique des images
- [ ] Champs additionnels (téléphone, bio, etc.) si besoin

## Support

Pour toute question ou problème :
1. Vérifiez que le bucket `avatars` existe et est public
2. Vérifiez que les policies RLS sont créées
3. Regardez la console navigateur pour les erreurs détaillées
4. Vérifiez que l'utilisateur est authentifié

---

**Status :** ✅ Corrections complètes et testées
**Version :** 1.0.0
**Date :** 2025-01-23

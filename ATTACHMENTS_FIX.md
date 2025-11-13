# 🔧 Fix: Configuration du Système d'Attachments

## ⚠️ Problème Actuel

L'erreur **"Failed to create attachment record"** se produit car :
1. ✅ Import de `pdf-parse` corrigé
2. ❌ La table `conversation_attachments` n'existe pas dans la base de données
3. ❌ Le bucket de storage `conversation-attachments` n'est pas créé

## 📋 Solution Rapide (5 minutes)

### Étape 1 : Appliquer le script de configuration

1. **Ouvrir le Supabase Dashboard**
   - Aller sur : https://supabase.com/dashboard
   - Sélectionner votre projet : `mzolqvxmdgbwonigsdoz`

2. **Ouvrir le SQL Editor**
   - Menu latéral → **SQL Editor**
   - Cliquer sur **"New query"**

3. **Copier et exécuter le script**
   - Ouvrir le fichier : `supabase/setup-attachments.sql`
   - Copier tout le contenu
   - Coller dans le SQL Editor
   - Cliquer sur **"Run"** (ou Ctrl+Enter)

4. **Vérifier le résultat**

   Vous devriez voir dans les résultats :
   ```
   ✓ Table conversation_attachments créée
   ✓ Bucket conversation-attachments créé
   ✓ Policies RLS configurées (4 policies)
   ✓ Storage policies configurées (4 policies)
   ```

### Étape 2 : Tester l'upload

1. **Recharger l'application**
   - Le serveur Next.js est déjà relancé avec le code corrigé
   - Aller sur : http://localhost:3000/chat

2. **Essayer d'uploader un document**
   - Cliquer sur l'icône de pièce jointe
   - Sélectionner un PDF ou une image
   - Envoyer un message avec le document

3. **Vérifier le succès**
   - Le document devrait s'uploader sans erreur
   - Vous devriez voir une prévisualisation
   - L'IA devrait pouvoir lire le contenu du document

## 🔍 Vérification Manuelle (optionnel)

Si vous voulez vérifier que tout est bien configuré, exécutez ces requêtes SQL :

```sql
-- Vérifier que la table existe
SELECT * FROM public.conversation_attachments LIMIT 5;

-- Vérifier que le bucket existe
SELECT * FROM storage.buckets WHERE id = 'conversation-attachments';

-- Lister les policies RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('conversation_attachments', 'objects')
ORDER BY tablename, policyname;
```

## ❓ En Cas de Problème

### Erreur : "relation already exists"
C'est normal ! Cela signifie que certaines parties existent déjà. Le script utilise `IF NOT EXISTS` et `ON CONFLICT DO NOTHING`, donc c'est sans danger.

### Erreur : "permission denied"
Assurez-vous d'être connecté avec un compte admin sur le dashboard Supabase.

### Le bucket n'est pas créé
Si le bucket existe déjà mais avec de mauvaises configurations :

```sql
-- Supprimer l'ancien bucket
DELETE FROM storage.buckets WHERE id = 'conversation-attachments';

-- Puis réexécuter le script setup-attachments.sql
```

### L'upload échoue toujours
Vérifiez les logs du serveur pour voir l'erreur exacte :
```bash
# Les logs sont affichés dans le terminal où vous avez lancé npm run dev
```

## 📝 Ce qui a été corrigé

1. **Import pdf-parse** (lib/utils/file-processing.ts:7)
   ```typescript
   // Avant (❌ ne fonctionnait pas)
   const pdf = (await import('pdf-parse')).default

   // Après (✅ fonctionne)
   import pdf from 'pdf-parse'
   ```

2. **Script SQL de configuration**
   - Crée la table `conversation_attachments` avec tous les champs nécessaires
   - Configure les index pour les performances
   - Active le RLS avec les bonnes policies
   - Crée le bucket de storage avec les bonnes limites
   - Configure les policies de storage pour la sécurité

## 🎯 Prochaines Étapes

Une fois le système d'attachments fonctionnel, vous pourrez :
- ✅ Uploader des images (JPEG, PNG, GIF, WebP)
- ✅ Uploader des PDFs (extraction automatique du texte)
- ✅ Voir des miniatures des images
- ✅ L'IA pourra lire le contenu des documents

## 🆘 Besoin d'aide ?

Si le problème persiste après avoir suivi ces étapes, envoyez-moi :
1. Les logs du serveur (copier les erreurs en rouge)
2. Le résultat de la vérification SQL
3. Une capture d'écran de l'erreur dans le navigateur

# 🔥 FORCER LE REDÉMARRAGE DE POSTGREST

## Le Problème
Le cache PostgREST refuse de se rafraîchir même après `NOTIFY pgrst, 'reload schema'`.

## Solution 1 : Via Dashboard Supabase (Recommandé) ✅

1. **Aller dans Supabase Dashboard**
   - URL : https://supabase.com/dashboard/project/[votre-project-id]

2. **Settings → Database → Connection Pooling**
   - Ou Settings → API

3. **Chercher "Restart" ou "Reset"**
   - Il devrait y avoir un bouton "Restart API server" ou similaire
   - OU aller dans Settings → General → "Pause project" puis "Resume project"

## Solution 2 : Modifier Quelque Chose qui Force le Rechargement

Exécutez ce script SQL qui va créer puis supprimer une table dummy pour forcer PostgREST à recharger :

```sql
-- Créer une table dummy
CREATE TABLE public.force_reload_dummy (id INT);

-- Attendre
SELECT pg_sleep(1);

-- Supprimer la table
DROP TABLE public.force_reload_dummy;

-- Notifier PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

SELECT 'PostgREST devrait se recharger dans 10-30 secondes' as message;
```

## Solution 3 : Attendre (Dernier Recours)

Le cache PostgREST sur Supabase hosted se rafraîchit automatiquement toutes les **5-10 minutes**.

Attendez 10 minutes, puis réessayez l'upload.

## Vérification

Après avoir forcé le redémarrage, testez avec ce script :

```sql
-- Tester si PostgREST voit la table
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'conversation_attachments';
```

Si ça retourne `conversation_attachments`, alors PostgREST devrait pouvoir y accéder.

## Si Rien ne Fonctionne

Contactez le support Supabase ou redémarrez complètement votre projet :
- Dashboard → Settings → General → "Pause project"
- Attendez 30 secondes
- "Resume project"

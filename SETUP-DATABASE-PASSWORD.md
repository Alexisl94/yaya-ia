# Configuration du mot de passe PostgreSQL

## Pourquoi c'est nécessaire

En raison d'un bug de cache PostgREST qui empêche l'accès à la table `conversation_attachments`, nous utilisons maintenant une connexion PostgreSQL directe qui contourne complètement PostgREST.

## Comment obtenir le mot de passe

1. **Aller dans le Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz

2. **Aller dans Settings → Database**
   - Cliquer sur "Settings" dans la sidebar gauche
   - Cliquer sur "Database"

3. **Trouver "Connection String"**
   - Chercher la section "Connection String"
   - Sélectionner l'onglet **"Direct connection"** (PAS "Connection pooling")
   - Vous verrez quelque chose comme :
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.mzolqvxmdgbwonigsdoz.supabase.co:5432/postgres
     ```

4. **Copier le mot de passe**
   - Cliquer sur le bouton pour révéler le mot de passe
   - Copier uniquement le mot de passe (la partie après `postgres:` et avant `@db.`)

5. **Ajouter à .env.local**
   - Ouvrir le fichier `.env.local` à la racine du projet
   - Ajouter cette ligne :
     ```
     SUPABASE_DB_PASSWORD=votre_mot_de_passe_ici
     ```
   - Sauvegarder le fichier

6. **Redémarrer le serveur**
   - Arrêter le serveur de dev (Ctrl+C)
   - Relancer `npm run dev`

## Vérification

Après avoir ajouté le mot de passe et redémarré, tentez d'uploader un fichier. Vous devriez voir dans les logs :

```
✅ Direct PostgreSQL pool created, bypassing PostgREST
🔧 Using DIRECT PostgreSQL connection to bypass PostgREST completely
✅ Direct PostgreSQL INSERT succeeded! ID: [uuid]
```

Si vous voyez ces messages, l'upload fonctionne !

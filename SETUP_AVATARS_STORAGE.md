# Configuration du Storage pour les Avatars

## Étape 1 : Créer le bucket dans Supabase Dashboard

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Storage** dans le menu de gauche
4. Cliquez sur **New bucket**
5. Nommez-le `avatars`
6. Cochez **Public bucket** (pour permettre la lecture publique)
7. Cliquez sur **Create bucket**

## Étape 2 : Configurer les politiques RLS

1. Allez dans **SQL Editor** dans le menu de gauche
2. Cliquez sur **New query**
3. Copiez-collez le contenu du fichier `supabase/setup-avatars-storage.sql`
4. Exécutez la requête avec **Run** ou `Ctrl+Enter`

## Étape 3 : Vérifier la configuration

Dans l'onglet **Storage > avatars > Policies**, vous devriez voir :
- ✅ Users can upload their own avatar (INSERT)
- ✅ Users can update their own avatar (UPDATE)
- ✅ Users can delete their own avatar (DELETE)
- ✅ Anyone can view avatars (SELECT)

## Alternative : Configuration manuelle des politiques

Si le script SQL ne fonctionne pas, vous pouvez créer manuellement les politiques :

### Policy 1 : Upload
- **Name:** Users can upload their own avatar
- **Policy command:** INSERT
- **Target roles:** authenticated
- **Using expression:** `bucket_id = 'avatars'`

### Policy 2 : Update
- **Name:** Users can update their own avatar
- **Policy command:** UPDATE
- **Target roles:** authenticated
- **Using expression:** `bucket_id = 'avatars'`

### Policy 3 : Delete
- **Name:** Users can delete their own avatar
- **Policy command:** DELETE
- **Target roles:** authenticated
- **Using expression:** `bucket_id = 'avatars'`

### Policy 4 : View
- **Name:** Anyone can view avatars
- **Policy command:** SELECT
- **Target roles:** public
- **Using expression:** `bucket_id = 'avatars'`

## Test

Après la configuration :
1. Allez sur http://localhost:3000/settings
2. Cliquez sur "Changer la photo"
3. Sélectionnez une image (JPG, PNG ou GIF, max 2MB)
4. L'avatar devrait s'uploader et s'afficher immédiatement

## Troubleshooting

Si l'upload échoue :
1. Vérifiez que le bucket `avatars` existe et est public
2. Vérifiez que les policies RLS sont bien créées
3. Regardez la console du navigateur pour voir l'erreur exacte
4. Vérifiez que l'utilisateur est bien authentifié

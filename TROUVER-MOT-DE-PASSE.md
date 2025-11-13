# Comment trouver le mot de passe PostgreSQL dans Supabase

## Option 1 : Database Settings (Recommandé)

1. Allez sur : https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz/settings/database
2. Cherchez une section qui s'appelle :
   - "Connection string" OU
   - "Database password" OU
   - "Connection info" OU
   - "Direct connection"
3. Il devrait y avoir un champ avec un mot de passe masqué et un bouton pour le révéler

## Option 2 : API Settings

1. Allez sur : https://supabase.com/dashboard/project/mzolqvxmdgbwonigsdoz/settings/api
2. Descendez jusqu'à trouver "Database URL" ou "Connection strings"
3. Cherchez une option "Direct connection" ou "Session mode"

## Option 3 : Project Settings → Database

1. Cliquez sur "Settings" (icône d'engrenage en bas à gauche)
2. Cliquez sur "Database"
3. Cherchez n'importe quelle section mentionnant "password" ou "connection"
4. Il devrait y avoir une URI PostgreSQL qui ressemble à :
   ```
   postgresql://postgres.[xxx]:[MOT-DE-PASSE]@db.xxx.supabase.co:5432/postgres
   ```

## Option 4 : Réinitialiser le mot de passe (si vraiment introuvable)

Si vous ne trouvez vraiment pas le mot de passe :

1. Allez dans Settings → Database
2. Cherchez un bouton "Reset database password" ou "Change password"
3. Créez un nouveau mot de passe
4. Copiez-le et donnez-le moi

## Ce que je cherche

Une fois que vous trouvez le mot de passe, il devrait ressembler à quelque chose comme :
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
OU un mot de passe plus simple avec lettres, chiffres et symboles.

## Captures d'écran

Si vous ne trouvez toujours pas, faites une capture d'écran de la page Settings → Database et je vous aiderai à localiser le mot de passe.

# 🚀 Configuration Supabase - yaya.ia

## Obtenir vos clés Supabase

### Option 1: Depuis Supabase Dashboard (Recommandé)

1. **Aller sur** https://supabase.com/dashboard
2. **Se connecter** ou créer un compte
3. **Sélectionner** votre projet `yaya-ia` (ou en créer un)
4. **Cliquer** sur l'icône ⚙️ **Settings** (en bas à gauche)
5. **Aller dans** **API**
6. **Copier les valeurs:**

```
Project URL:
https://[votre-project-id].supabase.co

anon/public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

service_role key (⚠️ Secret):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Option 2: Depuis Supabase CLI

Si vous avez configuré Supabase localement:

```bash
# Afficher les variables
supabase status

# Résultat:
API URL: http://localhost:54321
DB URL: postgresql://...
anon key: eyJhbGciOiJI...
service_role key: eyJhbGciOiJI...
```

## Mettre à jour .env.local

Ouvrez le fichier `.env.local` et remplacez:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[votre-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

⚠️ **Important:**
- La `NEXT_PUBLIC_SUPABASE_URL` doit commencer par `https://`
- Les clés JWT sont très longues (plusieurs centaines de caractères)
- Le `service_role key` est **TRÈS SENSIBLE** - ne jamais le committer

## Vérifier la configuration

Une fois les clés ajoutées:

```bash
# 1. Redémarrer le serveur
npm run dev

# 2. Tester la connexion
curl http://localhost:3000/api/test-supabase
```

## Troubleshooting

### Erreur: "Invalid supabaseUrl"
- Vérifiez que l'URL commence par `https://`
- Pas d'espace avant/après l'URL
- Format: `https://xxxxx.supabase.co` (sans slash à la fin)

### Erreur: "Invalid JWT"
- Copiez la clé complète (ne coupez rien)
- Pas de retour à la ligne dans la clé
- Vérifiez que vous utilisez la bonne clé (anon vs service_role)

### Erreur: "Project not found"
- Vérifiez que votre projet Supabase existe
- Vérifiez que vous êtes connecté au bon compte

## Base de données

Si votre base de données n'est pas encore créée:

```bash
# 1. Appliquer les migrations
npm run db:push

# 2. Seed les données de test
npm run db:seed
```

## Alternative: Supabase Local

Pour développer en local sans compte Supabase:

```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Initialiser Supabase local
supabase init

# 3. Démarrer Supabase local
supabase start

# 4. Utiliser les URL/clés locales dans .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[clé affichée dans la console]
```

---

**Besoin d'aide ?** Consultez la [documentation Supabase](https://supabase.com/docs)

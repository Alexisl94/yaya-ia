# Comment appliquer la migration

## Étape 1 : Aller sur Supabase Dashboard

1. Ouvrez https://supabase.com/dashboard
2. Sélectionnez votre projet `yaya-ia`
3. Allez dans **SQL Editor** (dans le menu latéral gauche)

## Étape 2 : Exécuter la migration

1. Cliquez sur **New Query**
2. Copiez tout le contenu du fichier : `supabase/migrations/20250114000001_add_llm_models_and_functional_type.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** (en bas à droite)

## Étape 3 : Vérifier

La migration devrait s'exécuter sans erreur et vous verrez :
- ✅ Les nouveaux modèles LLM disponibles (haiku, gpt-4o-mini, gpt-4o, sonnet, opus)
- ✅ Le champ `functional_type` ajouté
- ✅ Les colonnes de stats (`total_conversations`, `total_cost_usd`, etc.)
- ✅ La vue `agent_optimization_recommendations` créée
- ✅ La fonction `get_user_monthly_budget` créée

## En cas d'erreur

Si vous voyez des erreurs du type "column already exists", c'est normal ! Certaines colonnes existent peut-être déjà. Vous pouvez :
1. Ignorer ces erreurs
2. Ou supprimer les lignes `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` qui posent problème

## Après la migration

Une fois la migration appliquée, l'interface va automatiquement utiliser les nouveaux champs !

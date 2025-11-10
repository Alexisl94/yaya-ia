# Supabase Storage Setup for Attachments

## 📦 Créer le bucket de stockage

Le bucket Supabase Storage ne peut pas être créé via migration SQL. Tu dois le créer manuellement :

### Option 1 : Via l'interface Supabase (Recommandé) ✅

1. Va sur **Supabase Dashboard** → **Storage**
2. Clique sur **"New bucket"**
3. Configure comme suit :
   - **Name**: `conversation-attachments`
   - **Public**: ❌ **NON** (Private)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp, application/pdf`

4. Clique sur **"Create bucket"**

### Option 2 : Via SQL (Alternative)

Si tu préfères SQL, exécute ceci dans le SQL Editor :

```sql
-- Insert bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'conversation-attachments',
  'conversation-attachments',
  false,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);
```

---

## 🔒 Configurer les RLS Policies pour le Storage

Une fois le bucket créé, exécute ces policies dans le SQL Editor :

```sql
-- Policy: Users can upload their own files
CREATE POLICY "Users can upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view their own attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 📁 Structure de stockage

Les fichiers seront organisés comme suit :

```
conversation-attachments/
  └── {user_id}/
      └── {conversation_id}/
          ├── {timestamp}_{filename}.jpg
          ├── {timestamp}_{filename}.pdf
          └── thumbnails/
              └── {timestamp}_{filename}_thumb.jpg
```

Exemple :
```
conversation-attachments/
  └── a1b2c3d4-e5f6-7890-abcd-ef1234567890/
      └── conv_xyz123/
          ├── 1704672000000_facture.pdf
          ├── 1704672001000_maquette.jpg
          └── thumbnails/
              └── 1704672000000_facture_thumb.jpg
```

---

## ✅ Vérification

Pour vérifier que tout fonctionne, exécute :

```sql
SELECT * FROM storage.buckets WHERE id = 'conversation-attachments';
SELECT * FROM storage.objects WHERE bucket_id = 'conversation-attachments' LIMIT 10;
```

Tu devrais voir le bucket avec les bonnes configurations.

---

## 🔧 En cas de problème

Si le bucket existe déjà avec de mauvaises configs, supprime-le :

```sql
DELETE FROM storage.buckets WHERE id = 'conversation-attachments';
```

Puis recrée-le avec les bonnes configurations.

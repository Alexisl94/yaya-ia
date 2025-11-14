-- =============================================================================
-- FIX: Ajouter text/plain aux types MIME autorisés
-- =============================================================================
-- Ce script permet d'uploader des fichiers texte (pour le web scraping)
-- Exécutez ce script dans le SQL Editor de Supabase Dashboard
-- =============================================================================

-- Mettre à jour le bucket pour autoriser text/plain
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain'
]
WHERE id = 'conversation-attachments';

-- Vérifier que la modification a bien été appliquée
SELECT
  'Bucket mis à jour ✓' as status,
  id,
  name,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'conversation-attachments';

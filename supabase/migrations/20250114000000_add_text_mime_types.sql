-- Migration: Add text MIME types to conversation-attachments bucket
-- Date: 2025-01-14
-- Description: Allow text/plain files for scraped web content

-- Update bucket to allow text files
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

-- Verify the update
SELECT
  id,
  name,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'conversation-attachments';

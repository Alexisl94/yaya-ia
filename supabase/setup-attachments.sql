-- =============================================================================
-- SETUP SCRIPT: Attachments System
-- =============================================================================
-- Ce script configure tout le système d'attachments en une seule fois.
-- Exécutez ce script dans le SQL Editor de Supabase Dashboard.
-- =============================================================================

-- =============================================================================
-- ÉTAPE 1: Créer la table conversation_attachments
-- =============================================================================

-- Create attachments table
CREATE TABLE IF NOT EXISTS public.conversation_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type: 'image/jpeg', 'application/pdf', etc.
  file_size BIGINT NOT NULL, -- Size in bytes
  storage_path TEXT NOT NULL, -- Path in Supabase Storage

  -- Processing results
  extracted_text TEXT, -- For PDFs: extracted text content
  thumbnail_path TEXT, -- Path to thumbnail in storage (for PDFs)

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Dimensions for images, page count for PDFs, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 10485760) -- Max 10MB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_attachments_conversation_id ON public.conversation_attachments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON public.conversation_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON public.conversation_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON public.conversation_attachments(created_at DESC);

-- Enable RLS
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own attachments" ON public.conversation_attachments;
CREATE POLICY "Users can view their own attachments"
  ON public.conversation_attachments
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own attachments" ON public.conversation_attachments;
CREATE POLICY "Users can insert their own attachments"
  ON public.conversation_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own attachments" ON public.conversation_attachments;
CREATE POLICY "Users can update their own attachments"
  ON public.conversation_attachments
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own attachments" ON public.conversation_attachments;
CREATE POLICY "Users can delete their own attachments"
  ON public.conversation_attachments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_conversation_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_attachments_updated_at ON public.conversation_attachments;
CREATE TRIGGER update_conversation_attachments_updated_at
  BEFORE UPDATE ON public.conversation_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_attachments_updated_at();

-- Add comments
COMMENT ON TABLE public.conversation_attachments IS 'File attachments (images, PDFs) linked to conversations and messages';
COMMENT ON COLUMN public.conversation_attachments.extracted_text IS 'Extracted text content for PDFs, used for AI context';
COMMENT ON COLUMN public.conversation_attachments.metadata IS 'JSON metadata: width/height for images, page_count for PDFs, etc.';

-- =============================================================================
-- ÉTAPE 2: Créer le bucket de storage
-- =============================================================================

-- Insert bucket (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'conversation-attachments',
  'conversation-attachments',
  false,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- ÉTAPE 3: Configurer les RLS Policies pour le Storage
-- =============================================================================

-- Policy: Users can upload their own files
DROP POLICY IF EXISTS "Users can upload attachments" ON storage.objects;
CREATE POLICY "Users can upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own files
DROP POLICY IF EXISTS "Users can view their own attachments" ON storage.objects;
CREATE POLICY "Users can view their own attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own files
DROP POLICY IF EXISTS "Users can update their own attachments" ON storage.objects;
CREATE POLICY "Users can update their own attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;
CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'conversation-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

-- Vérifier que la table existe
SELECT 'Table conversation_attachments créée ✓' as status
WHERE EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'conversation_attachments'
);

-- Vérifier que le bucket existe
SELECT 'Bucket conversation-attachments créé ✓' as status
FROM storage.buckets
WHERE id = 'conversation-attachments';

-- Lister les policies RLS sur la table
SELECT 'Policies RLS configurées ✓' as status, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'conversation_attachments';

-- Lister les policies RLS sur le storage
SELECT 'Storage policies configurées ✓' as status, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%attachments%';

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================

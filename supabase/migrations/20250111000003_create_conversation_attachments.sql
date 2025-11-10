-- Migration: Create conversation_attachments table
-- Date: 2025-01-11
-- Description: Stores file attachments (images, PDFs) linked to conversations and messages

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
CREATE INDEX idx_attachments_conversation_id ON public.conversation_attachments(conversation_id);
CREATE INDEX idx_attachments_message_id ON public.conversation_attachments(message_id);
CREATE INDEX idx_attachments_user_id ON public.conversation_attachments(user_id);
CREATE INDEX idx_attachments_created_at ON public.conversation_attachments(created_at DESC);

-- Enable RLS
ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own attachments"
  ON public.conversation_attachments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attachments"
  ON public.conversation_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attachments"
  ON public.conversation_attachments
  FOR UPDATE
  USING (auth.uid() = user_id);

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

CREATE TRIGGER update_conversation_attachments_updated_at
  BEFORE UPDATE ON public.conversation_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_attachments_updated_at();

-- Add comments
COMMENT ON TABLE public.conversation_attachments IS 'File attachments (images, PDFs) linked to conversations and messages';
COMMENT ON COLUMN public.conversation_attachments.extracted_text IS 'Extracted text content for PDFs, used for AI context';
COMMENT ON COLUMN public.conversation_attachments.metadata IS 'JSON metadata: width/height for images, page_count for PDFs, etc.';

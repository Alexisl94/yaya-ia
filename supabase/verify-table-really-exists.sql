-- =============================================================================
-- VÉRIFICATION ULTIME : La table existe-t-elle VRAIMENT ?
-- =============================================================================

-- 1. Lister TOUTES les tables de public
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Chercher spécifiquement conversation_attachments
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'conversation_attachments'
    ) THEN 'TABLE EXISTE ✓'
    ELSE 'TABLE N''EXISTE PAS ✗✗✗'
  END as status;

-- 3. Si la table n'existe pas, la créer MAINTENANT
DO $$
BEGIN
  -- Vérifier si la table existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'conversation_attachments'
  ) THEN
    -- La table n'existe pas, la créer
    CREATE TABLE public.conversation_attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL,
      message_id UUID,
      user_id UUID NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size BIGINT NOT NULL,
      storage_path TEXT NOT NULL,
      extracted_text TEXT,
      thumbnail_path TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 10485760)
    );

    -- Index
    CREATE INDEX idx_attachments_conversation_id ON public.conversation_attachments(conversation_id);
    CREATE INDEX idx_attachments_message_id ON public.conversation_attachments(message_id);
    CREATE INDEX idx_attachments_user_id ON public.conversation_attachments(user_id);
    CREATE INDEX idx_attachments_created_at ON public.conversation_attachments(created_at DESC);

    -- RLS
    ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

    -- Policies (service_role bypass RLS automatiquement)
    CREATE POLICY "Service role bypass"
      ON public.conversation_attachments
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    CREATE POLICY "Users can view their own attachments"
      ON public.conversation_attachments FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own attachments"
      ON public.conversation_attachments FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    RAISE NOTICE 'TABLE CRÉÉE AVEC SUCCÈS !';
  ELSE
    RAISE NOTICE 'La table existe déjà';
  END IF;
END $$;

-- 4. Rafraîchir le cache PostgREST
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(2);
NOTIFY pgrst, 'reload schema';

-- 5. Vérification finale
SELECT 'VÉRIFICATION FINALE: ' ||
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'conversation_attachments'
    ) THEN '✓✓✓ TABLE EXISTE MAINTENANT ✓✓✓'
    ELSE '✗✗✗ ERREUR: TABLE INTROUVABLE ✗✗✗'
  END as result;

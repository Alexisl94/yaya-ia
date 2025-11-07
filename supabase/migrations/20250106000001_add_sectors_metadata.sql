-- Add metadata fields to sectors table
ALTER TABLE public.sectors 
ADD COLUMN IF NOT EXISTS base_expertise TEXT,
ADD COLUMN IF NOT EXISTS common_tasks TEXT[],
ADD COLUMN IF NOT EXISTS legal_context TEXT;

-- Update icon column comment to indicate it can store emoji
COMMENT ON COLUMN public.sectors.icon IS 'Emoji or Lucide icon name';
COMMENT ON COLUMN public.sectors.base_expertise IS 'Base expertise context for agents in this sector';
COMMENT ON COLUMN public.sectors.common_tasks IS 'Array of common tasks for this sector';
COMMENT ON COLUMN public.sectors.legal_context IS 'Legal obligations and context for this sector';

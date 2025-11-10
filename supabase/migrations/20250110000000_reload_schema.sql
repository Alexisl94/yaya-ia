-- Migration: Force PostgREST schema reload
-- Date: 2025-01-10
-- Description: Forces PostgREST to reload the schema cache to recognize agent_type column

-- Send notification to PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Alternative: Create a dummy function to trigger schema cache update
CREATE OR REPLACE FUNCTION public.trigger_schema_reload()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function triggers a schema reload by creating and dropping a temporary object
  NULL;
END;
$$;

-- Execute the function
SELECT public.trigger_schema_reload();

-- Drop the function as it's no longer needed
DROP FUNCTION IF EXISTS public.trigger_schema_reload();

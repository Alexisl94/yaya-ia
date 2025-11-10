-- Migration: Create function to update business_profile_id
-- Date: 2025-01-11
-- Description: Creates a function to safely update business_profile_id, bypassing PostgREST cache issues

CREATE OR REPLACE FUNCTION public.update_agent_business_profile(
  agent_id UUID,
  new_business_profile_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the business_profile_id (can be NULL)
  UPDATE public.agents
  SET business_profile_id = new_business_profile_id
  WHERE id = agent_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_agent_business_profile(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.update_agent_business_profile IS 'Safely updates the business_profile_id for a given agent, bypassing PostgREST cache issues';

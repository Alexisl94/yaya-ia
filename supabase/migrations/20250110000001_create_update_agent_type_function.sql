-- Migration: Create function to update agent_type
-- Date: 2025-01-10
-- Description: Creates a function to safely update agent_type, bypassing PostgREST cache issues

CREATE OR REPLACE FUNCTION public.update_agent_type(
  agent_id UUID,
  new_agent_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate agent_type value
  IF new_agent_type NOT IN ('companion', 'task') THEN
    RAISE EXCEPTION 'Invalid agent_type. Must be either companion or task';
  END IF;

  -- Update the agent_type
  UPDATE public.agents
  SET agent_type = new_agent_type
  WHERE id = agent_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_agent_type(UUID, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.update_agent_type IS 'Safely updates the agent_type for a given agent, bypassing PostgREST cache issues';

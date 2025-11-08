-- Migration: Create function to insert agents (bypasses PostgREST cache)
-- Date: 2025-01-08
-- Description: Creates a PostgreSQL function to create agents, bypassing PostgREST schema cache issues

CREATE OR REPLACE FUNCTION public.insert_agent(
  p_user_id UUID,
  p_sector_id UUID,
  p_name TEXT,
  p_system_prompt TEXT,
  p_template_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_model TEXT DEFAULT 'claude',
  p_agent_type TEXT DEFAULT 'companion',
  p_temperature DECIMAL(3,2) DEFAULT 0.7,
  p_max_tokens INTEGER DEFAULT 2000,
  p_settings JSONB DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_agent_id UUID;
  v_result JSON;
BEGIN
  -- Insert the agent
  INSERT INTO public.agents (
    user_id,
    sector_id,
    template_id,
    name,
    description,
    system_prompt,
    model,
    agent_type,
    temperature,
    max_tokens,
    settings
  ) VALUES (
    p_user_id,
    p_sector_id,
    p_template_id,
    p_name,
    p_description,
    p_system_prompt,
    p_model,
    p_agent_type,
    p_temperature,
    p_max_tokens,
    p_settings
  )
  RETURNING id INTO v_agent_id;

  -- Get the complete agent data
  SELECT row_to_json(a.*)
  INTO v_result
  FROM public.agents a
  WHERE a.id = v_agent_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_agent TO authenticated;

COMMENT ON FUNCTION public.insert_agent IS 'Creates a new agent with all fields including agent_type, bypassing PostgREST cache';

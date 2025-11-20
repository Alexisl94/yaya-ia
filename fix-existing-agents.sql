-- Script to fix agent_type for existing agents
-- This script should be run manually via Supabase SQL Editor

-- Option 1: If you know which agents should be 'task' agents, update them individually
-- Example:
-- UPDATE public.agents SET agent_type = 'task' WHERE name = 'NomDeLAgent';

-- Option 2: Check all agents and their current agent_type
SELECT id, name, agent_type, created_at
FROM public.agents
ORDER BY created_at DESC;

-- After reviewing the list above, you can update specific agents like this:
-- UPDATE public.agents SET agent_type = 'task' WHERE id = 'agent-uuid-here';

-- Note: All agents currently have agent_type = 'companion' by default
-- You need to manually identify which ones should be 'task' agents and update them

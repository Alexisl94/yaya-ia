-- Migration: Add agent_type column to agents table
-- Date: 2025-01-08
-- Description: Adds agent_type column to distinguish between companion and task agents

-- Add agent_type column to agents table
ALTER TABLE public.agents
ADD COLUMN agent_type TEXT NOT NULL DEFAULT 'companion' CHECK (agent_type IN ('companion', 'task'));

-- Create index for agent_type for efficient filtering
CREATE INDEX idx_agents_agent_type ON public.agents(agent_type);

-- Add comment to document the column
COMMENT ON COLUMN public.agents.agent_type IS 'Type of agent: companion (full context, generalist) or task (specific purpose)';

-- Migration: Add business_profile_id to agents table
-- Date: 2025-01-11
-- Description: Adds a foreign key to business_profiles table for centralized business information

-- Add business_profile_id column (nullable for backward compatibility)
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS business_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_business_profile_id ON public.agents(business_profile_id);

-- Add comment
COMMENT ON COLUMN public.agents.business_profile_id IS 'Reference to the centralized business profile. Nullable for backward compatibility with existing agents.';

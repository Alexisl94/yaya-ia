-- Migration: Create business_profiles table
-- Date: 2025-01-11
-- Description: Creates a centralized business profile table that all agents can reference

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic information
  business_name TEXT NOT NULL,
  business_type TEXT CHECK (business_type IN ('freelance', 'tpe', 'pme')),
  location TEXT,
  years_experience TEXT CHECK (years_experience IN ('0-2', '3-5', '6-10', '10+')),

  -- Context information
  main_clients TEXT,
  specificities TEXT,
  typical_project_size TEXT CHECK (typical_project_size IN ('small', 'medium', 'large', 'mixed')),
  main_challenges TEXT,
  tools_used TEXT,

  -- Goals and values
  primary_goals JSONB DEFAULT '[]'::jsonb,
  business_values TEXT,
  example_projects TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT business_profiles_user_id_unique UNIQUE (user_id)
);

-- Add indexes
CREATE INDEX idx_business_profiles_user_id ON public.business_profiles(user_id);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own business profile"
  ON public.business_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business profile"
  ON public.business_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
  ON public.business_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business profile"
  ON public.business_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_profiles_updated_at();

-- Add comment
COMMENT ON TABLE public.business_profiles IS 'Centralized business profile information that can be shared across multiple agents';

-- 03_hiring_manager_profiles.sql
-- Hiring manager profile schema for Zirak HR application

-- Create hiring_manager_profiles table
CREATE TABLE IF NOT EXISTS public.hiring_manager_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR,
  title VARCHAR,
  phone VARCHAR,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  department VARCHAR,
  profile_picture VARCHAR,
  linkedin_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_hiring_manager_profiles_user_id ON public.hiring_manager_profiles(user_id);
CREATE INDEX idx_hiring_manager_profiles_company_id ON public.hiring_manager_profiles(company_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_hiring_manager_profiles_timestamp
BEFORE UPDATE ON public.hiring_manager_profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to calculate profile completion for hiring managers
CREATE OR REPLACE FUNCTION calculate_hiring_manager_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_fields INTEGER := 6; -- Total number of important profile fields
  filled_fields INTEGER := 0;
BEGIN
  -- Count filled basic fields
  IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.title IS NOT NULL AND NEW.title != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.company_id IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.department IS NOT NULL AND NEW.department != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.profile_picture IS NOT NULL AND NEW.profile_picture != '' THEN filled_fields := filled_fields + 1; END IF;
  
  -- Update needs_profile_completion in users table if profile is complete
  IF (filled_fields::float / total_fields::float * 100)::integer >= 80 THEN
    UPDATE public.users SET needs_profile_completion = false WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile completion calculation
CREATE TRIGGER calculate_hiring_manager_profile_completion
BEFORE INSERT OR UPDATE ON public.hiring_manager_profiles
FOR EACH ROW EXECUTE FUNCTION calculate_hiring_manager_profile_completion();

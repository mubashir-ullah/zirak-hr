-- 02_talent_profiles.sql
-- Talent profile schema for Zirak HR application

-- Create talent_profiles table
CREATE TABLE IF NOT EXISTS public.talent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR,
  title VARCHAR,
  bio TEXT,
  phone VARCHAR,
  country VARCHAR,
  city VARCHAR,
  profile_picture VARCHAR,
  resume_url VARCHAR,
  linkedin_url VARCHAR,
  github_url VARCHAR,
  availability VARCHAR,
  german_level VARCHAR,
  visa_required BOOLEAN DEFAULT false,
  visa_type VARCHAR,
  profile_completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create talent_skills table
CREATE TABLE IF NOT EXISTS public.talent_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(talent_id, skill_id)
);

-- Create talent_education table
CREATE TABLE IF NOT EXISTS public.talent_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  institution VARCHAR NOT NULL,
  degree VARCHAR,
  field_of_study VARCHAR,
  start_date DATE,
  end_date DATE,
  current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create talent_experience table
CREATE TABLE IF NOT EXISTS public.talent_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  company VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  location VARCHAR,
  start_date DATE,
  end_date DATE,
  current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create talent_languages table
CREATE TABLE IF NOT EXISTS public.talent_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  language VARCHAR NOT NULL,
  proficiency language_proficiency NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(talent_id, language)
);

-- Create talent_preferences table
CREATE TABLE IF NOT EXISTS public.talent_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  preferred_job_types job_type[] DEFAULT '{}',
  preferred_locations VARCHAR[] DEFAULT '{}',
  remote_preference remote_preference DEFAULT 'flexible',
  min_salary INTEGER,
  salary_currency VARCHAR DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(talent_id)
);

-- Create indexes
CREATE INDEX idx_talent_profiles_user_id ON public.talent_profiles(user_id);
CREATE INDEX idx_talent_skills_talent_id ON public.talent_skills(talent_id);
CREATE INDEX idx_talent_skills_skill_id ON public.talent_skills(skill_id);
CREATE INDEX idx_talent_education_talent_id ON public.talent_education(talent_id);
CREATE INDEX idx_talent_experience_talent_id ON public.talent_experience(talent_id);
CREATE INDEX idx_talent_languages_talent_id ON public.talent_languages(talent_id);
CREATE INDEX idx_talent_preferences_talent_id ON public.talent_preferences(talent_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_talent_profiles_timestamp
BEFORE UPDATE ON public.talent_profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_talent_skills_timestamp
BEFORE UPDATE ON public.talent_skills
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_talent_education_timestamp
BEFORE UPDATE ON public.talent_education
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_talent_experience_timestamp
BEFORE UPDATE ON public.talent_experience
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_talent_languages_timestamp
BEFORE UPDATE ON public.talent_languages
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_talent_preferences_timestamp
BEFORE UPDATE ON public.talent_preferences
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_fields INTEGER := 12; -- Total number of important profile fields
  filled_fields INTEGER := 0;
  has_skills BOOLEAN;
  has_education BOOLEAN;
  has_experience BOOLEAN;
  has_languages BOOLEAN;
  has_preferences BOOLEAN;
BEGIN
  -- Count filled basic fields
  IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.title IS NOT NULL AND NEW.title != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.bio IS NOT NULL AND NEW.bio != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.country IS NOT NULL AND NEW.country != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.city IS NOT NULL AND NEW.city != '' THEN filled_fields := filled_fields + 1; END IF;
  IF NEW.profile_picture IS NOT NULL AND NEW.profile_picture != '' THEN filled_fields := filled_fields + 1; END IF;
  
  -- Check for skills
  SELECT EXISTS(SELECT 1 FROM public.talent_skills WHERE talent_id = NEW.id LIMIT 1) INTO has_skills;
  IF has_skills THEN filled_fields := filled_fields + 1; END IF;
  
  -- Check for education
  SELECT EXISTS(SELECT 1 FROM public.talent_education WHERE talent_id = NEW.id LIMIT 1) INTO has_education;
  IF has_education THEN filled_fields := filled_fields + 1; END IF;
  
  -- Check for experience
  SELECT EXISTS(SELECT 1 FROM public.talent_experience WHERE talent_id = NEW.id LIMIT 1) INTO has_experience;
  IF has_experience THEN filled_fields := filled_fields + 1; END IF;
  
  -- Check for languages
  SELECT EXISTS(SELECT 1 FROM public.talent_languages WHERE talent_id = NEW.id LIMIT 1) INTO has_languages;
  IF has_languages THEN filled_fields := filled_fields + 1; END IF;
  
  -- Check for preferences
  SELECT EXISTS(SELECT 1 FROM public.talent_preferences WHERE talent_id = NEW.id LIMIT 1) INTO has_preferences;
  IF has_preferences THEN filled_fields := filled_fields + 1; END IF;
  
  -- Calculate percentage
  NEW.profile_completion_percentage := (filled_fields::float / total_fields::float * 100)::integer;
  
  -- Update needs_profile_completion in users table if profile is complete
  IF NEW.profile_completion_percentage >= 80 THEN
    UPDATE public.users SET needs_profile_completion = false WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile completion calculation
CREATE TRIGGER calculate_talent_profile_completion
BEFORE INSERT OR UPDATE ON public.talent_profiles
FOR EACH ROW EXECUTE FUNCTION calculate_profile_completion();

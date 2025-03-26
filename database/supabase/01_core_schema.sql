-- 01_core_schema.sql
-- Core schema for Zirak HR application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('talent', 'hiring_manager', 'admin');
CREATE TYPE job_status AS ENUM ('active', 'filled', 'expired', 'draft');
CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'contract', 'freelance', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid-level', 'senior', 'lead');
CREATE TYPE application_status AS ENUM ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn');
CREATE TYPE interview_type AS ENUM ('phone', 'video', 'onsite', 'technical');
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'canceled', 'rescheduled');
CREATE TYPE language_proficiency AS ENUM ('basic', 'conversational', 'fluent', 'native');
CREATE TYPE remote_preference AS ENUM ('remote', 'hybrid', 'onsite', 'flexible');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'coding', 'essay');
CREATE TYPE skill_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  role user_role NOT NULL,
  needs_role_selection BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  social_provider VARCHAR,
  needs_profile_completion BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_social_accounts table
CREATE TABLE IF NOT EXISTS public.user_social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider VARCHAR NOT NULL,
  provider_id VARCHAR NOT NULL,
  provider_email VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  industry VARCHAR,
  size VARCHAR,
  website VARCHAR,
  logo_url VARCHAR,
  headquarters VARCHAR,
  founded_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create company_locations table
CREATE TABLE IF NOT EXISTS public.company_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  country VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  address VARCHAR,
  is_headquarters BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL UNIQUE,
  category VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_user_social_accounts_provider ON public.user_social_accounts(provider, provider_id);
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_skills_name ON public.skills(name);
CREATE INDEX idx_skills_category ON public.skills(category);

-- Create update_timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_social_accounts_timestamp
BEFORE UPDATE ON public.user_social_accounts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_companies_timestamp
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_company_locations_timestamp
BEFORE UPDATE ON public.company_locations
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_skills_timestamp
BEFORE UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

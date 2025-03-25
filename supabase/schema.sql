-- Create tables for Zirak HR application

-- Users table (managed by Supabase Auth with additional fields)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('talent', 'hiring_manager', 'admin')),
  organization TEXT,
  position TEXT,
  social_provider TEXT,
  needs_role_selection BOOLEAN DEFAULT TRUE,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'junior', 'mid-level', 'senior', 'lead')),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'EUR',
  remote BOOLEAN DEFAULT FALSE,
  application_deadline TEXT,
  posted_by UUID REFERENCES public.users(id),
  posted_date TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'filled', 'expired', 'draft')) DEFAULT 'draft',
  application_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  industry TEXT,
  company_size TEXT,
  benefits TEXT[] DEFAULT '{}',
  education_level TEXT,
  german_level TEXT,
  visa_sponsorship BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')) DEFAULT 'applied',
  applied_date TEXT NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  notes TEXT,
  hiring_manager_notes TEXT,
  last_status_update_date TEXT NOT NULL,
  match_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Saved Jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  saved_date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Talent Profiles table
CREATE TABLE IF NOT EXISTS public.talent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience TEXT,
  country TEXT,
  city TEXT,
  german_level TEXT,
  availability TEXT,
  visa_required BOOLEAN DEFAULT FALSE,
  visa_type TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  bio TEXT,
  profile_picture TEXT,
  resume_url TEXT,
  title TEXT,
  phone TEXT,
  education JSONB[] DEFAULT '{}',
  preferred_job_types TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  languages JSONB[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Hiring Manager Profiles table
CREATE TABLE IF NOT EXISTS public.hiring_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  company_description TEXT,
  company_size TEXT,
  industry TEXT,
  company_website TEXT,
  company_logo TEXT,
  company_location TEXT,
  hiring_needs TEXT,
  contact_phone TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('application_status_change', 'new_application', 'job_match', 'profile_update', 'new_message', 'system')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RPC function for bulk updating jobs
CREATE OR REPLACE FUNCTION bulk_update_jobs(jobs_data JSONB[])
RETURNS SETOF jobs AS $$
DECLARE
  job_data JSONB;
  job_id UUID;
BEGIN
  FOREACH job_data IN ARRAY jobs_data LOOP
    job_id := (job_data->>'id')::UUID;
    
    UPDATE public.jobs
    SET
      title = COALESCE(job_data->>'title', title),
      company = COALESCE(job_data->>'company', company),
      location = COALESCE(job_data->>'location', location),
      description = COALESCE(job_data->>'description', description),
      requirements = COALESCE((job_data->>'requirements')::TEXT[], requirements),
      skills = COALESCE((job_data->>'skills')::TEXT[], skills),
      job_type = COALESCE(job_data->>'job_type', job_type),
      experience_level = COALESCE(job_data->>'experience_level', experience_level),
      salary_min = COALESCE((job_data->>'salary_min')::INTEGER, salary_min),
      salary_max = COALESCE((job_data->>'salary_max')::INTEGER, salary_max),
      salary_currency = COALESCE(job_data->>'salary_currency', salary_currency),
      remote = COALESCE((job_data->>'remote')::BOOLEAN, remote),
      application_deadline = COALESCE(job_data->>'application_deadline', application_deadline),
      status = COALESCE(job_data->>'status', status),
      application_count = COALESCE((job_data->>'application_count')::INTEGER, application_count),
      view_count = COALESCE((job_data->>'view_count')::INTEGER, view_count),
      industry = COALESCE(job_data->>'industry', industry),
      company_size = COALESCE(job_data->>'company_size', company_size),
      benefits = COALESCE((job_data->>'benefits')::TEXT[], benefits),
      education_level = COALESCE(job_data->>'education_level', education_level),
      german_level = COALESCE(job_data->>'german_level', german_level),
      visa_sponsorship = COALESCE((job_data->>'visa_sponsorship')::BOOLEAN, visa_sponsorship),
      updated_at = now()
    WHERE id = job_id;
    
    RETURN QUERY SELECT * FROM public.jobs WHERE id = job_id;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_jobs_timestamp
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_job_applications_timestamp
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_saved_jobs_timestamp
BEFORE UPDATE ON public.saved_jobs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_talent_profiles_timestamp
BEFORE UPDATE ON public.talent_profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_hiring_profiles_timestamp
BEFORE UPDATE ON public.hiring_profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_notifications_timestamp
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Set up Row Level Security (RLS) policies
-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Jobs table policies
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs" ON public.jobs
  FOR SELECT USING (status = 'active');

CREATE POLICY "Hiring managers can view their own jobs" ON public.jobs
  FOR SELECT USING (posted_by = auth.uid());

CREATE POLICY "Hiring managers can insert their own jobs" ON public.jobs
  FOR INSERT WITH CHECK (posted_by = auth.uid());

CREATE POLICY "Hiring managers can update their own jobs" ON public.jobs
  FOR UPDATE USING (posted_by = auth.uid());

CREATE POLICY "Hiring managers can delete their own jobs" ON public.jobs
  FOR DELETE USING (posted_by = auth.uid());

-- Job Applications table policies
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talent can view their own applications" ON public.job_applications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Talent can insert their own applications" ON public.job_applications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Hiring managers can view applications for their jobs" ON public.job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs WHERE id = job_id AND posted_by = auth.uid()
    )
  );

CREATE POLICY "Hiring managers can update applications for their jobs" ON public.job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.jobs WHERE id = job_id AND posted_by = auth.uid()
    )
  );

-- Saved Jobs table policies
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talent can view their own saved jobs" ON public.saved_jobs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Talent can insert their own saved jobs" ON public.saved_jobs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Talent can delete their own saved jobs" ON public.saved_jobs
  FOR DELETE USING (user_id = auth.uid());

-- Talent Profiles table policies
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talent can view their own profile" ON public.talent_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Talent can update their own profile" ON public.talent_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Talent can insert their own profile" ON public.talent_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Hiring managers can view talent profiles" ON public.talent_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'hiring_manager'
    )
  );

-- Hiring Profiles table policies
ALTER TABLE public.hiring_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hiring managers can view their own profile" ON public.hiring_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Hiring managers can update their own profile" ON public.hiring_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Hiring managers can insert their own profile" ON public.hiring_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view hiring profiles" ON public.hiring_profiles
  FOR SELECT USING (true);

-- Notifications table policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

-- User Events table for analytics
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id and event_type for faster queries
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON public.user_events(timestamp);

-- Create RPC function to increment job view count
CREATE OR REPLACE FUNCTION increment_job_view_count(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.jobs
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to increment job application count
CREATE OR REPLACE FUNCTION increment_job_application_count(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.jobs
  SET application_count = COALESCE(application_count, 0) + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add timestamp trigger for user_events
CREATE TRIGGER update_user_events_timestamp
BEFORE UPDATE ON public.user_events
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Set up Row Level Security (RLS) policies for user_events
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events" ON public.user_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own events" ON public.user_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all events" ON public.user_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

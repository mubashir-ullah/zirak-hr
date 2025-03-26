-- 04_jobs.sql
-- Jobs schema for Zirak HR application

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  posted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  location VARCHAR,
  description TEXT,
  job_type job_type NOT NULL,
  experience_level experience_level NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR DEFAULT 'EUR',
  remote BOOLEAN DEFAULT false,
  application_deadline DATE,
  posted_date DATE,
  status job_status NOT NULL DEFAULT 'draft',
  application_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  industry VARCHAR,
  department VARCHAR,
  education_level VARCHAR,
  german_level VARCHAR,
  visa_sponsorship BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job_skills table
CREATE TABLE IF NOT EXISTS public.job_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  importance INTEGER CHECK (importance BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, skill_id)
);

-- Create job_benefits table
CREATE TABLE IF NOT EXISTS public.job_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  benefit VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job_requirements table
CREATE TABLE IF NOT EXISTS public.job_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  requirement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX idx_jobs_remote ON public.jobs(remote);
CREATE INDEX idx_jobs_industry ON public.jobs(industry);
CREATE INDEX idx_jobs_department ON public.jobs(department);
CREATE INDEX idx_job_skills_job_id ON public.job_skills(job_id);
CREATE INDEX idx_job_skills_skill_id ON public.job_skills(skill_id);
CREATE INDEX idx_job_benefits_job_id ON public.job_benefits(job_id);
CREATE INDEX idx_job_requirements_job_id ON public.job_requirements(job_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_jobs_timestamp
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_job_skills_timestamp
BEFORE UPDATE ON public.job_skills
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_job_benefits_timestamp
BEFORE UPDATE ON public.job_benefits
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_job_requirements_timestamp
BEFORE UPDATE ON public.job_requirements
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to automatically set posted_date when job status changes to active
CREATE OR REPLACE FUNCTION set_job_posted_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing to active and posted_date is not set
  IF NEW.status = 'active' AND (OLD.status != 'active' OR OLD.status IS NULL) AND (NEW.posted_date IS NULL OR NEW.posted_date = '') THEN
    NEW.posted_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for setting posted_date
CREATE TRIGGER set_job_posted_date_trigger
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION set_job_posted_date();

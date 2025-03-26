-- 05_applications.sql
-- Applications schema for Zirak HR application

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'applied',
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resume_url VARCHAR,
  cover_letter TEXT,
  notes TEXT,
  hiring_manager_notes TEXT,
  match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
  last_status_update_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create application_interviews table
CREATE TABLE IF NOT EXISTS public.application_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  interview_type interview_type NOT NULL,
  status interview_status NOT NULL DEFAULT 'scheduled',
  feedback TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  saved_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Create indexes
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_job_applications_applied_date ON public.job_applications(applied_date);
CREATE INDEX idx_application_interviews_application_id ON public.application_interviews(application_id);
CREATE INDEX idx_application_interviews_interviewer_id ON public.application_interviews(interviewer_id);
CREATE INDEX idx_application_interviews_scheduled_date ON public.application_interviews(scheduled_date);
CREATE INDEX idx_application_interviews_status ON public.application_interviews(status);
CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs(job_id);
CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_job_applications_timestamp
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_application_interviews_timestamp
BEFORE UPDATE ON public.application_interviews
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_saved_jobs_timestamp
BEFORE UPDATE ON public.saved_jobs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to update application count when a new application is created
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment application count on job
  UPDATE public.jobs
  SET application_count = application_count + 1
  WHERE id = NEW.job_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating application count
CREATE TRIGGER update_job_application_count_trigger
AFTER INSERT ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- Function to update last_status_update_date when application status changes
CREATE OR REPLACE FUNCTION update_application_status_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing, update the last_status_update_date
  IF NEW.status != OLD.status THEN
    NEW.last_status_update_date = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating status date
CREATE TRIGGER update_application_status_date_trigger
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION update_application_status_date();

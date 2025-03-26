-- 07_analytics_notifications.sql
-- Analytics and notifications schema for Zirak HR application

-- Create analytics_job_views table
CREATE TABLE IF NOT EXISTS public.analytics_job_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  view_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  source VARCHAR, -- 'search', 'recommendation', 'direct', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics_application_funnel table
CREATE TABLE IF NOT EXISTS public.analytics_application_funnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  screenings INTEGER DEFAULT 0,
  interviews INTEGER DEFAULT 0,
  offers INTEGER DEFAULT 0,
  hires INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, date)
);

-- Create analytics_user_activity table
CREATE TABLE IF NOT EXISTS public.analytics_user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type VARCHAR NOT NULL, -- 'login', 'profile_update', 'job_view', 'job_application', etc.
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL, -- 'application_update', 'interview', 'message', 'system', etc.
  related_entity_type VARCHAR, -- 'job', 'application', 'interview', etc.
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject VARCHAR,
  content TEXT NOT NULL,
  related_entity_type VARCHAR, -- 'job', 'application', 'interview', etc.
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_analytics_job_views_job_id ON public.analytics_job_views(job_id);
CREATE INDEX idx_analytics_job_views_user_id ON public.analytics_job_views(user_id);
CREATE INDEX idx_analytics_job_views_view_date ON public.analytics_job_views(view_date);
CREATE INDEX idx_analytics_application_funnel_job_id ON public.analytics_application_funnel(job_id);
CREATE INDEX idx_analytics_application_funnel_date ON public.analytics_application_funnel(date);
CREATE INDEX idx_analytics_user_activity_user_id ON public.analytics_user_activity(user_id);
CREATE INDEX idx_analytics_user_activity_activity_date ON public.analytics_user_activity(activity_date);
CREATE INDEX idx_analytics_user_activity_activity_type ON public.analytics_user_activity(activity_type);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_analytics_application_funnel_timestamp
BEFORE UPDATE ON public.analytics_application_funnel
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to increment job view count when a job is viewed
CREATE OR REPLACE FUNCTION increment_job_view_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment view count on job
  UPDATE public.jobs
  SET view_count = view_count + 1
  WHERE id = NEW.job_id;
  
  -- Update or insert into analytics_application_funnel
  INSERT INTO public.analytics_application_funnel (job_id, views, date)
  VALUES (NEW.job_id, 1, CURRENT_DATE)
  ON CONFLICT (job_id, date)
  DO UPDATE SET views = public.analytics_application_funnel.views + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for incrementing job view count
CREATE TRIGGER increment_job_view_count_trigger
AFTER INSERT ON public.analytics_job_views
FOR EACH ROW EXECUTE FUNCTION increment_job_view_count();

-- Function to update application funnel when application status changes
CREATE OR REPLACE FUNCTION update_application_funnel()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new application
  IF TG_OP = 'INSERT' THEN
    -- Update or insert into analytics_application_funnel for applications
    INSERT INTO public.analytics_application_funnel (job_id, applications, date)
    VALUES (NEW.job_id, 1, CURRENT_DATE)
    ON CONFLICT (job_id, date)
    DO UPDATE SET applications = public.analytics_application_funnel.applications + 1;
  
  -- If this is an update and status changed
  ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    -- Update the appropriate counter based on the new status
    CASE NEW.status
      WHEN 'screening' THEN
        INSERT INTO public.analytics_application_funnel (job_id, screenings, date)
        VALUES (NEW.job_id, 1, CURRENT_DATE)
        ON CONFLICT (job_id, date)
        DO UPDATE SET screenings = public.analytics_application_funnel.screenings + 1;
      
      WHEN 'interview' THEN
        INSERT INTO public.analytics_application_funnel (job_id, interviews, date)
        VALUES (NEW.job_id, 1, CURRENT_DATE)
        ON CONFLICT (job_id, date)
        DO UPDATE SET interviews = public.analytics_application_funnel.interviews + 1;
      
      WHEN 'offer' THEN
        INSERT INTO public.analytics_application_funnel (job_id, offers, date)
        VALUES (NEW.job_id, 1, CURRENT_DATE)
        ON CONFLICT (job_id, date)
        DO UPDATE SET offers = public.analytics_application_funnel.offers + 1;
      
      ELSE
        -- No specific counter for other statuses
        NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating application funnel
CREATE TRIGGER update_application_funnel_trigger
AFTER INSERT OR UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION update_application_funnel();

-- Function to create notification when application status changes
CREATE OR REPLACE FUNCTION create_application_status_notification()
RETURNS TRIGGER AS $$
DECLARE
  job_title VARCHAR;
  company_name VARCHAR;
  talent_user_id UUID;
  hiring_manager_id UUID;
  notification_title VARCHAR;
  notification_message TEXT;
BEGIN
  -- Only create notification if status changed
  IF NEW.status != OLD.status THEN
    -- Get job title and company name
    SELECT j.title, c.name, j.posted_by
    INTO job_title, company_name, hiring_manager_id
    FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = NEW.job_id;
    
    -- Get talent user ID
    talent_user_id := NEW.user_id;
    
    -- Create notification for talent
    notification_title := 'Application Status Updated';
    notification_message := 'Your application for ' || job_title || ' at ' || company_name || ' has been updated to ' || NEW.status;
    
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      related_entity_type,
      related_entity_id
    ) VALUES (
      talent_user_id,
      notification_title,
      notification_message,
      'application_update',
      'application',
      NEW.id
    );
    
    -- Create notification for hiring manager if status is 'applied' (new application)
    IF NEW.status = 'applied' AND OLD.status IS NULL THEN
      notification_title := 'New Job Application';
      notification_message := 'A new application has been received for ' || job_title;
      
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_entity_type,
        related_entity_id
      ) VALUES (
        hiring_manager_id,
        notification_title,
        notification_message,
        'application_update',
        'application',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for creating application status notifications
CREATE TRIGGER create_application_status_notification_trigger
AFTER UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION create_application_status_notification();

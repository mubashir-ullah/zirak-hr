-- 06_skill_assessments.sql
-- Skill assessments schema for Zirak HR application

-- Create skill_tests table
CREATE TABLE IF NOT EXISTS public.skill_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  difficulty skill_difficulty NOT NULL DEFAULT 'intermediate',
  duration_minutes INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create skill_test_questions table
CREATE TABLE IF NOT EXISTS public.skill_test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.skill_tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- For multiple choice questions
  correct_answer TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create skill_test_attempts table
CREATE TABLE IF NOT EXISTS public.skill_test_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.skill_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  passed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create skill_test_answers table
CREATE TABLE IF NOT EXISTS public.skill_test_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.skill_test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.skill_test_questions(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  points_awarded INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_skill_tests_skill_id ON public.skill_tests(skill_id);
CREATE INDEX idx_skill_tests_difficulty ON public.skill_tests(difficulty);
CREATE INDEX idx_skill_test_questions_test_id ON public.skill_test_questions(test_id);
CREATE INDEX idx_skill_test_attempts_test_id ON public.skill_test_attempts(test_id);
CREATE INDEX idx_skill_test_attempts_user_id ON public.skill_test_attempts(user_id);
CREATE INDEX idx_skill_test_answers_attempt_id ON public.skill_test_answers(attempt_id);
CREATE INDEX idx_skill_test_answers_question_id ON public.skill_test_answers(question_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_skill_tests_timestamp
BEFORE UPDATE ON public.skill_tests
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_skill_test_questions_timestamp
BEFORE UPDATE ON public.skill_test_questions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_skill_test_attempts_timestamp
BEFORE UPDATE ON public.skill_test_attempts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_skill_test_answers_timestamp
BEFORE UPDATE ON public.skill_test_answers
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to calculate test score when an attempt is completed
CREATE OR REPLACE FUNCTION calculate_test_score()
RETURNS TRIGGER AS $$
DECLARE
  total_points INTEGER;
  earned_points INTEGER;
  test_passing_score INTEGER;
BEGIN
  -- Only calculate if end_time is being set (test completion)
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    -- Get total possible points for the test
    SELECT SUM(points) INTO total_points
    FROM public.skill_test_questions
    WHERE test_id = NEW.test_id;
    
    -- Get points earned by the user
    SELECT COALESCE(SUM(points_awarded), 0) INTO earned_points
    FROM public.skill_test_answers
    WHERE attempt_id = NEW.id;
    
    -- Get passing score for the test
    SELECT passing_score INTO test_passing_score
    FROM public.skill_tests
    WHERE id = NEW.test_id;
    
    -- Calculate score as percentage
    IF total_points > 0 THEN
      NEW.score := (earned_points::float / total_points::float * 100)::integer;
    ELSE
      NEW.score := 0;
    END IF;
    
    -- Determine if passed
    NEW.passed := NEW.score >= test_passing_score;
    
    -- If passed, update skill verification for the user
    IF NEW.passed THEN
      -- Get the skill_id for this test
      WITH test_skill AS (
        SELECT skill_id FROM public.skill_tests WHERE id = NEW.test_id
      )
      -- Get the talent_id for this user
      , user_talent AS (
        SELECT id FROM public.talent_profiles WHERE user_id = NEW.user_id
      )
      -- Update or insert the skill verification
      , existing_skill AS (
        SELECT id 
        FROM public.talent_skills 
        WHERE talent_id = (SELECT id FROM user_talent)
        AND skill_id = (SELECT skill_id FROM test_skill)
      )
      UPDATE public.talent_skills
      SET is_verified = true,
          verification_date = now()
      WHERE id = (SELECT id FROM existing_skill)
      AND NOT EXISTS (
        -- Only insert if no update was made
        SELECT 1 
        FROM existing_skill
        WHERE EXISTS (
          INSERT INTO public.talent_skills (
            talent_id, 
            skill_id, 
            proficiency_level, 
            is_verified, 
            verification_date
          )
          SELECT 
            (SELECT id FROM user_talent),
            (SELECT skill_id FROM test_skill),
            3, -- Default proficiency level
            true,
            now()
          WHERE NOT EXISTS (SELECT 1 FROM existing_skill)
          RETURNING 1
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calculating test score
CREATE TRIGGER calculate_test_score_trigger
BEFORE UPDATE ON public.skill_test_attempts
FOR EACH ROW EXECUTE FUNCTION calculate_test_score();

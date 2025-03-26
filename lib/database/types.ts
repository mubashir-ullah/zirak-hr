/**
 * Database types for Zirak HR application
 * 
 * This file contains TypeScript type definitions for all database tables
 * and related enums to ensure type safety throughout the application.
 */

// Enum types
export type UserRole = 'talent' | 'hiring_manager' | 'admin';
export type JobStatus = 'active' | 'filled' | 'expired' | 'draft';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
export type ExperienceLevel = 'entry' | 'junior' | 'mid-level' | 'senior' | 'lead';
export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
export type InterviewType = 'phone' | 'video' | 'onsite' | 'technical';
export type InterviewStatus = 'scheduled' | 'completed' | 'canceled' | 'rescheduled';
export type LanguageProficiency = 'basic' | 'conversational' | 'fluent' | 'native';
export type RemotePreference = 'remote' | 'hybrid' | 'onsite' | 'flexible';
export type QuestionType = 'multiple_choice' | 'coding' | 'essay';
export type SkillDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type NotificationType = 'application_update' | 'interview' | 'message' | 'system';
export type EntityType = 'job' | 'application' | 'interview' | 'profile';

// Base type with common fields
export interface BaseRecord {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

// User related types
export interface User extends BaseRecord {
  name: string;
  email: string;
  role: UserRole;
  needs_role_selection?: boolean;
  email_verified?: boolean;
  social_provider?: string;
  needs_profile_completion?: boolean;
}

export interface UserSocialAccount extends BaseRecord {
  user_id: string;
  provider: string;
  provider_id: string;
  provider_email?: string;
}

// Profile related types
export interface TalentProfile extends BaseRecord {
  user_id: string;
  full_name?: string;
  title?: string;
  bio?: string;
  phone?: string;
  country?: string;
  city?: string;
  profile_picture?: string;
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  availability?: string;
  german_level?: string;
  visa_required?: boolean;
  visa_type?: string;
  profile_completion_percentage?: number;
}

export interface TalentSkill extends BaseRecord {
  talent_id: string;
  skill_id: string;
  proficiency_level?: number;
  is_verified?: boolean;
  verification_date?: string;
}

export interface TalentEducation extends BaseRecord {
  talent_id: string;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
}

export interface TalentExperience extends BaseRecord {
  talent_id: string;
  company: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
}

export interface TalentLanguage extends BaseRecord {
  talent_id: string;
  language: string;
  proficiency: LanguageProficiency;
}

export interface TalentPreference extends BaseRecord {
  talent_id: string;
  preferred_job_types?: JobType[];
  preferred_locations?: string[];
  remote_preference?: RemotePreference;
  min_salary?: number;
  salary_currency?: string;
}

export interface HiringManagerProfile extends BaseRecord {
  user_id: string;
  full_name?: string;
  title?: string;
  phone?: string;
  company_id?: string;
  department?: string;
  profile_picture?: string;
  linkedin_url?: string;
}

export interface Company extends BaseRecord {
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  logo_url?: string;
  headquarters?: string;
  founded_year?: number;
}

export interface CompanyLocation extends BaseRecord {
  company_id: string;
  country: string;
  city: string;
  address?: string;
  is_headquarters?: boolean;
}

// Job related types
export interface Skill extends BaseRecord {
  name: string;
  category?: string;
}

export interface Job extends BaseRecord {
  title: string;
  company_id: string;
  posted_by: string;
  location?: string;
  description?: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  remote?: boolean;
  application_deadline?: string;
  posted_date?: string;
  status: JobStatus;
  application_count?: number;
  view_count?: number;
  industry?: string;
  department?: string;
  education_level?: string;
  german_level?: string;
  visa_sponsorship?: boolean;
}

export interface JobSkill extends BaseRecord {
  job_id: string;
  skill_id: string;
  importance?: number;
}

export interface JobBenefit extends BaseRecord {
  job_id: string;
  benefit: string;
}

export interface JobRequirement extends BaseRecord {
  job_id: string;
  requirement: string;
}

// Application related types
export interface JobApplication extends BaseRecord {
  job_id: string;
  user_id: string;
  status: ApplicationStatus;
  applied_date?: string;
  resume_url?: string;
  cover_letter?: string;
  notes?: string;
  hiring_manager_notes?: string;
  match_score?: number;
  last_status_update_date?: string;
}

export interface ApplicationInterview extends BaseRecord {
  application_id: string;
  interviewer_id: string;
  scheduled_date: string;
  duration_minutes: number;
  interview_type: InterviewType;
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
}

export interface SavedJob extends BaseRecord {
  job_id: string;
  user_id: string;
  saved_date?: string;
  notes?: string;
}

// Skill assessment related types
export interface SkillTest extends BaseRecord {
  name: string;
  description?: string;
  skill_id: string;
  difficulty: SkillDifficulty;
  duration_minutes: number;
  passing_score: number;
}

export interface SkillTestQuestion extends BaseRecord {
  test_id: string;
  question: string;
  question_type: QuestionType;
  options?: any; // JSONB in database
  correct_answer?: string;
  points: number;
}

export interface SkillTestAttempt extends BaseRecord {
  test_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  score?: number;
  passed?: boolean;
}

export interface SkillTestAnswer extends BaseRecord {
  attempt_id: string;
  question_id: string;
  answer?: string;
  is_correct?: boolean;
  points_awarded?: number;
}

// Analytics related types
export interface AnalyticsJobView extends BaseRecord {
  job_id: string;
  user_id?: string;
  view_date?: string;
  source?: string;
}

export interface AnalyticsApplicationFunnel extends BaseRecord {
  job_id: string;
  views?: number;
  applications?: number;
  screenings?: number;
  interviews?: number;
  offers?: number;
  hires?: number;
  date: string;
}

export interface AnalyticsUserActivity extends BaseRecord {
  user_id: string;
  activity_type: string;
  activity_date?: string;
  details?: any; // JSONB in database
}

// Notification related types
export interface Notification extends BaseRecord {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_entity_type?: EntityType;
  related_entity_id?: string;
  is_read?: boolean;
}

export interface Message extends BaseRecord {
  sender_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  related_entity_type?: EntityType;
  related_entity_id?: string;
  is_read?: boolean;
}

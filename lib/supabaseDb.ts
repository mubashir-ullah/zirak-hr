import supabase from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for our database tables
export type Role = 'talent' | 'hiring_manager' | 'admin';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  organization?: string;
  position?: string;
  social_provider?: string;
  needs_role_selection?: boolean;
  resume_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobData {
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experience_level: 'entry' | 'junior' | 'mid-level' | 'senior' | 'lead';
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  remote: boolean;
  application_deadline: string;
  posted_by: string;
  posted_date: string;
  status: 'active' | 'filled' | 'expired' | 'draft';
  application_count: number;
  view_count: number;
  industry: string;
  company_size: string;
  benefits: string[];
  education_level: string;
  german_level: string;
  visa_sponsorship: boolean;
  created_at?: string;
  updated_at?: string;
}

// Job Application Types
export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export interface JobApplicationData {
  id?: string;
  job_id: string;
  user_id: string;
  status: ApplicationStatus;
  applied_date: string;
  resume_url: string;
  cover_letter: string;
  notes: string;
  hiring_manager_notes?: string;
  last_status_update_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavedJobData {
  id?: string;
  job_id: string;
  user_id: string;
  saved_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// User operations
export const createUser = async (userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Promise<UserData | null> => {
  const newUser = {
    ...userData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('users')
    .insert(newUser)
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
};

export const getUserByEmail = async (email: string): Promise<UserData | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    console.error('Error finding user by email:', error);
    return null;
  }

  return data;
};

export const updateUserRole = async (userId: string, role: Role): Promise<UserData | null> => {
  const { data, error } = await supabase
    .from('users')
    .update({ 
      role, 
      needs_role_selection: false,
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    return null;
  }

  return data;
};

export const findUserByEmail = async (email: string): Promise<UserData | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    console.error('Error finding user by email:', error);
    return null;
  }

  return data;
};

export const findUserById = async (id: string): Promise<UserData | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error finding user by id:', error);
    return null;
  }

  return data;
};

export const updateUser = async (id: string, userData: Partial<UserData>): Promise<UserData | null> => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...userData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  return data;
};

// Job operations
export const getAllJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all jobs:', error);
    return { jobs: null, error };
  }

  return { jobs: data, error: null };
};

export const createJob = async (jobData: Omit<JobData, 'id' | 'created_at' | 'updated_at'>): Promise<{ job: JobData | null, error: any }> => {
  const newJob = {
    ...jobData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('jobs')
    .insert(newJob)
    .select()
    .single();

  if (error) {
    console.error('Error creating job:', error);
    return { job: null, error };
  }

  return { job: data, error: null };
};

export const findJobById = async (id: string): Promise<JobData | null> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error finding job by id:', error);
    return null;
  }

  return data;
};

export const updateJob = async (id: string, jobData: Partial<JobData>): Promise<JobData | null> => {
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...jobData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating job:', error);
    return null;
  }

  return data;
};

export const updateJobs = async (jobsData: Partial<JobData>[]) => {
  if (!Array.isArray(jobsData) || jobsData.length === 0) {
    return { success: false, error: 'Invalid jobs data' };
  }

  // Use a transaction to update all jobs
  const { error } = await supabase.rpc('bulk_update_jobs', {
    jobs_data: jobsData
  });

  if (error) {
    console.error('Error updating jobs:', error);
    return { success: false, error };
  }

  return { success: true, error: null };
};

// Job Application operations
export const createJobApplication = async (applicationData: Omit<JobApplicationData, 'id' | 'created_at' | 'updated_at'>): Promise<JobApplicationData | null> => {
  const newApplication = {
    ...applicationData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('job_applications')
    .insert(newApplication)
    .select()
    .single();

  if (error) {
    console.error('Error creating job application:', error);
    return null;
  }

  return data;
};

export const findJobApplicationById = async (id: string): Promise<JobApplicationData | null> => {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error finding job application by id:', error);
    return null;
  }

  return data;
};

export const findJobApplicationsByUserId = async (userId: string): Promise<JobApplicationData[] | null> => {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error finding job applications by user id:', error);
    return null;
  }

  return data;
};

export const findJobApplicationsByJobId = async (jobId: string): Promise<JobApplicationData[] | null> => {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', jobId);

  if (error) {
    console.error('Error finding job applications by job id:', error);
    return null;
  }

  return data;
};

export const updateJobApplication = async (id: string, applicationData: Partial<JobApplicationData>): Promise<JobApplicationData | null> => {
  const { data, error } = await supabase
    .from('job_applications')
    .update({ ...applicationData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating job application:', error);
    return null;
  }

  return data;
};

// Saved Job operations
export const createSavedJob = async (savedJobData: Omit<SavedJobData, 'id' | 'created_at' | 'updated_at'>): Promise<SavedJobData | null> => {
  const newSavedJob = {
    ...savedJobData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('saved_jobs')
    .insert(newSavedJob)
    .select()
    .single();

  if (error) {
    console.error('Error creating saved job:', error);
    return null;
  }

  return data;
};

export const findSavedJobsByUserId = async (userId: string): Promise<SavedJobData[] | null> => {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error finding saved jobs by user id:', error);
    return null;
  }

  return data;
};

export const deleteSavedJob = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting saved job:', error);
    return false;
  }

  return true;
};

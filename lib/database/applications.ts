/**
 * Job application database operations for Zirak HR
 * 
 * This file contains functions for interacting with application-related tables
 * in the Supabase database.
 */

import supabase from '../supabase';
import { 
  JobApplication, 
  ApplicationStatus, 
  ApplicationInterview,
  InterviewType,
  InterviewStatus,
  SavedJob
} from './types';

/**
 * Create a job application
 * @param applicationData Application data to create
 * @returns The created application or null if an error occurred
 */
export async function createJobApplication(
  applicationData: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>
): Promise<JobApplication | null> {
  try {
    // Check if user has already applied to this job
    const { data: existingApplication } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', applicationData.job_id)
      .eq('user_id', applicationData.user_id)
      .single();
    
    if (existingApplication) {
      console.error('User has already applied to this job');
      return null;
    }
    
    // Create the application
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        ...applicationData,
        status: applicationData.status || 'applied',
        applied_date: applicationData.applied_date || new Date().toISOString(),
        last_status_update_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating job application:', error);
      return null;
    }
    
    // Record user activity
    await supabase
      .from('analytics_user_activity')
      .insert({
        user_id: applicationData.user_id,
        activity_type: 'job_application',
        activity_date: new Date().toISOString(),
        details: { job_id: applicationData.job_id },
        created_at: new Date().toISOString()
      });
    
    return data;
  } catch (error) {
    console.error('Exception in createJobApplication:', error);
    return null;
  }
}

/**
 * Find a job application by ID
 * @param id Application ID to search for
 * @returns The application or null if not found
 */
export async function findJobApplicationById(id: string): Promise<JobApplication | null> {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs(
          id,
          title,
          company_id,
          location,
          job_type,
          experience_level,
          remote,
          company:companies(name, logo_url)
        ),
        user:users(id, name, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error finding job application by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in findJobApplicationById:', error);
    return null;
  }
}

/**
 * Find job applications by user ID
 * @param userId User ID to search for
 * @returns Array of applications or null if an error occurred
 */
export async function findJobApplicationsByUserId(userId: string): Promise<JobApplication[] | null> {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:jobs(
          id,
          title,
          company_id,
          location,
          job_type,
          experience_level,
          remote,
          company:companies(name, logo_url)
        )
      `)
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });
    
    if (error) {
      console.error('Error finding job applications by user ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in findJobApplicationsByUserId:', error);
    return null;
  }
}

/**
 * Find job applications by job ID
 * @param jobId Job ID to search for
 * @returns Array of applications or null if an error occurred
 */
export async function findJobApplicationsByJobId(jobId: string): Promise<JobApplication[] | null> {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        user:users(id, name, email),
        talent:talent_profiles!job_applications_user_id_fkey(
          id,
          profile_picture,
          resume_url,
          skills:talent_skills(
            skill:skills(name, category)
          )
        )
      `)
      .eq('job_id', jobId)
      .order('applied_date', { ascending: false });
    
    if (error) {
      console.error('Error finding job applications by job ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in findJobApplicationsByJobId:', error);
    return null;
  }
}

/**
 * Update a job application's status
 * @param id Application ID to update
 * @param status New status
 * @param notes Optional notes to add
 * @returns The updated application or null if an error occurred
 */
export async function updateJobApplicationStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string
): Promise<JobApplication | null> {
  try {
    const updateData: Partial<JobApplication> = {
      status,
      last_status_update_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (notes) {
      updateData.hiring_manager_notes = notes;
    }
    
    const { data, error } = await supabase
      .from('job_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job application status:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updateJobApplicationStatus:', error);
    return null;
  }
}

/**
 * Schedule an interview for a job application
 * @param applicationId Application ID to schedule interview for
 * @param interviewData Interview data
 * @returns The created interview or null if an error occurred
 */
export async function scheduleInterview(
  applicationId: string,
  interviewData: Omit<ApplicationInterview, 'id' | 'application_id' | 'created_at' | 'updated_at'>
): Promise<ApplicationInterview | null> {
  try {
    // Create the interview
    const { data, error } = await supabase
      .from('application_interviews')
      .insert({
        application_id: applicationId,
        ...interviewData,
        status: interviewData.status || 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error scheduling interview:', error);
      return null;
    }
    
    // Update application status to 'interview' if it's not already past that stage
    const { data: application } = await supabase
      .from('job_applications')
      .select('status')
      .eq('id', applicationId)
      .single();
    
    if (application && ['applied', 'screening'].includes(application.status)) {
      await updateJobApplicationStatus(applicationId, 'interview');
    }
    
    return data;
  } catch (error) {
    console.error('Exception in scheduleInterview:', error);
    return null;
  }
}

/**
 * Get interviews for a job application
 * @param applicationId Application ID to get interviews for
 * @returns Array of interviews or null if an error occurred
 */
export async function getInterviewsByApplicationId(applicationId: string): Promise<ApplicationInterview[] | null> {
  try {
    const { data, error } = await supabase
      .from('application_interviews')
      .select(`
        *,
        interviewer:users(id, name, email)
      `)
      .eq('application_id', applicationId)
      .order('scheduled_date', { ascending: true });
    
    if (error) {
      console.error('Error getting interviews by application ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getInterviewsByApplicationId:', error);
    return null;
  }
}

/**
 * Update an interview
 * @param id Interview ID to update
 * @param interviewData Interview data to update
 * @returns The updated interview or null if an error occurred
 */
export async function updateInterview(
  id: string,
  interviewData: Partial<Omit<ApplicationInterview, 'id' | 'application_id' | 'created_at' | 'updated_at'>>
): Promise<ApplicationInterview | null> {
  try {
    const { data, error } = await supabase
      .from('application_interviews')
      .update({
        ...interviewData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating interview:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updateInterview:', error);
    return null;
  }
}

/**
 * Save a job for a user
 * @param jobId Job ID to save
 * @param userId User ID to save for
 * @param notes Optional notes
 * @returns The saved job or null if an error occurred
 */
export async function saveJob(
  jobId: string,
  userId: string,
  notes?: string
): Promise<SavedJob | null> {
  try {
    // Check if job is already saved
    const { data: existingSavedJob } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .single();
    
    if (existingSavedJob) {
      // Update existing saved job if notes are provided
      if (notes) {
        const { data, error } = await supabase
          .from('saved_jobs')
          .update({
            notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSavedJob.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating saved job:', error);
          return null;
        }
        
        return data;
      }
      
      // Otherwise, job is already saved
      return existingSavedJob as SavedJob;
    }
    
    // Create new saved job
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({
        job_id: jobId,
        user_id: userId,
        saved_date: new Date().toISOString(),
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving job:', error);
      return null;
    }
    
    // Record user activity
    await supabase
      .from('analytics_user_activity')
      .insert({
        user_id: userId,
        activity_type: 'job_save',
        activity_date: new Date().toISOString(),
        details: { job_id: jobId },
        created_at: new Date().toISOString()
      });
    
    return data;
  } catch (error) {
    console.error('Exception in saveJob:', error);
    return null;
  }
}

/**
 * Unsave a job for a user
 * @param jobId Job ID to unsave
 * @param userId User ID to unsave for
 * @returns True if successful, false otherwise
 */
export async function unsaveJob(jobId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('job_id', jobId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error unsaving job:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in unsaveJob:', error);
    return false;
  }
}

/**
 * Get saved jobs for a user
 * @param userId User ID to get saved jobs for
 * @returns Array of saved jobs or null if an error occurred
 */
export async function getSavedJobsByUserId(userId: string): Promise<SavedJob[] | null> {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job:jobs(
          id,
          title,
          company_id,
          location,
          job_type,
          experience_level,
          remote,
          salary_min,
          salary_max,
          salary_currency,
          company:companies(name, logo_url)
        )
      `)
      .eq('user_id', userId)
      .order('saved_date', { ascending: false });
    
    if (error) {
      console.error('Error getting saved jobs by user ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getSavedJobsByUserId:', error);
    return null;
  }
}

/**
 * Check if a job is saved by a user
 * @param jobId Job ID to check
 * @param userId User ID to check for
 * @returns True if saved, false otherwise
 */
export async function isJobSavedByUser(jobId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in isJobSavedByUser:', error);
    return false;
  }
}

/**
 * Record a job view
 * @param jobId Job ID that was viewed
 * @param userId Optional user ID that viewed the job
 * @param source Optional source of the view
 */
export async function recordJobView(
  jobId: string,
  userId?: string,
  source?: string
): Promise<void> {
  try {
    await supabase
      .from('analytics_job_views')
      .insert({
        job_id: jobId,
        user_id: userId,
        view_date: new Date().toISOString(),
        source,
        created_at: new Date().toISOString()
      });
    
    if (userId) {
      // Record user activity
      await supabase
        .from('analytics_user_activity')
        .insert({
          user_id: userId,
          activity_type: 'job_view',
          activity_date: new Date().toISOString(),
          details: { job_id: jobId, source },
          created_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Exception in recordJobView:', error);
  }
}

/**
 * Database Functions
 * 
 * This file contains all the database functions used throughout the application.
 * These functions abstract the database operations and provide a consistent interface
 * for interacting with the Supabase database.
 */

import supabase from './supabase';
import { createNotification } from './notifications';

// User Types
export type UserRole = 'talent' | 'hiring_manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  phone?: string;
  department?: string;
  company?: string;
  profile_picture?: string;
  resume_url?: string;
  needs_role_selection: boolean;
  needs_profile_completion: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary_range?: string;
  job_type: string;
  experience_level: string;
  skills: string[];
  posted_by: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  application_deadline?: string;
  created_at: string;
  updated_at: string;
}

// Job Application Types
export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offered' | 'rejected' | 'withdrawn' | 'hired';
  applied_date: string;
  resume_url?: string;
  cover_letter?: string;
  notes?: string;
  last_status_update_date: string;
  match_score?: number;
  job?: Job;
}

// Talent Profile Types
export interface TalentProfile {
  id: string;
  user_id: string;
  headline?: string;
  summary?: string;
  skills: string[];
  experience: any[];
  education: any[];
  certifications: any[];
  languages: any[];
  preferences: any;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  created_at: string;
}

// Pagination Options
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Result with Pagination
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==========================================
// User Functions
// ==========================================

/**
 * Find a user by ID
 */
export async function findUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
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
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: Partial<User>): Promise<User | null> {
  try {
    // Ensure required fields
    if (!userData.id || !userData.email) {
      console.error('User ID and email are required');
      return null;
    }
    
    // Set default values
    const now = new Date().toISOString();
    const user = {
      ...userData,
      email: userData.email.toLowerCase(),
      created_at: now,
      updated_at: now,
      needs_role_selection: userData.needs_role_selection ?? true,
      needs_profile_completion: userData.needs_profile_completion ?? true,
      email_verified: userData.email_verified ?? false
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update a user
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
  try {
    // Set updated_at
    const updatedData = {
      ...userData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<User | null> {
  try {
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
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
}

// ==========================================
// Job Functions
// ==========================================

/**
 * Find a job by ID
 */
export async function findJobById(jobId: string): Promise<Job | null> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (error) {
      console.error('Error finding job by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error finding job by ID:', error);
    return null;
  }
}

/**
 * Get all jobs with optional filters
 */
export async function getAllJobs(options: {
  status?: string;
  postedBy?: string;
  search?: string;
  skills?: string[];
  page?: number;
  limit?: number;
} = {}): Promise<PaginatedResult<Job> | null> {
  try {
    const {
      status,
      postedBy,
      search,
      skills,
      page = 1,
      limit = 10
    } = options;
    
    // Start building the query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (postedBy) {
      query = query.eq('posted_by', postedBy);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`);
    }
    
    if (skills && skills.length > 0) {
      // Filter jobs that have at least one of the specified skills
      query = query.contains('skills', skills);
    }
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Apply pagination
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error getting jobs:', error);
      return null;
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error getting jobs:', error);
    return null;
  }
}

/**
 * Create a new job
 */
export async function createJob(jobData: Partial<Job>): Promise<Job | null> {
  try {
    // Set default values
    const now = new Date().toISOString();
    const job = {
      ...jobData,
      created_at: now,
      updated_at: now,
      status: jobData.status || 'draft'
    };
    
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating job:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating job:', error);
    return null;
  }
}

/**
 * Update a job
 */
export async function updateJob(jobId: string, jobData: Partial<Job>): Promise<Job | null> {
  try {
    // Set updated_at
    const updatedData = {
      ...jobData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('jobs')
      .update(updatedData)
      .eq('id', jobId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating job:', error);
    return null;
  }
}

/**
 * Delete a job
 */
export async function deleteJob(jobId: string): Promise<boolean> {
  try {
    // First check if there are any applications for this job
    const { count, error: countError } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);
    
    if (countError) {
      console.error('Error checking job applications:', countError);
      return false;
    }
    
    // If there are applications, don't delete the job, just mark it as archived
    if (count && count > 0) {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      
      if (updateError) {
        console.error('Error archiving job:', updateError);
        return false;
      }
      
      return true;
    }
    
    // If no applications, we can safely delete the job
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (deleteError) {
      console.error('Error deleting job:', deleteError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
}

// ==========================================
// Job Application Functions
// ==========================================

/**
 * Find job applications by user ID
 */
export async function findJobApplicationsByUserId(
  userId: string,
  options: {
    status?: string;
    page?: number;
    limit?: number;
    includeJobDetails?: boolean;
  } = {}
): Promise<PaginatedResult<JobApplication> | null> {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      includeJobDetails = false
    } = options;
    
    // Build the select statement
    const select = includeJobDetails 
      ? '*, jobs:job_id(*)' 
      : '*';
    
    // Start building the query
    let query = supabase
      .from('job_applications')
      .select(select, { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Apply pagination
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error finding job applications:', error);
      return null;
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error finding job applications:', error);
    return null;
  }
}

/**
 * Find job applications by hiring manager ID
 */
export async function findJobApplicationsByHiringManager(
  hiringManagerId: string,
  options: {
    jobId?: string;
    status?: string;
    page?: number;
    limit?: number;
    includeJobDetails?: boolean;
    includeUserDetails?: boolean;
  } = {}
): Promise<PaginatedResult<JobApplication> | null> {
  try {
    const {
      jobId,
      status,
      page = 1,
      limit = 10,
      includeJobDetails = false,
      includeUserDetails = false
    } = options;
    
    // Build the select statement based on what details to include
    let select = '*';
    
    if (includeJobDetails && includeUserDetails) {
      select = '*, jobs:job_id(*), users:user_id(id, name, email, organization, position)';
    } else if (includeJobDetails) {
      select = '*, jobs:job_id(*)';
    } else if (includeUserDetails) {
      select = '*, users:user_id(id, name, email, organization, position)';
    }
    
    // First, get all jobs posted by the hiring manager
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('posted_by', hiringManagerId);
    
    if (jobsError) {
      console.error('Error finding jobs by hiring manager:', jobsError);
      return null;
    }
    
    if (!jobs || jobs.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit
      };
    }
    
    // Get job IDs
    const jobIds = jobs.map((job: { id: string }) => job.id);
    
    // Start building the query for applications
    let query = supabase
      .from('job_applications')
      .select(select, { count: 'exact' })
      .in('job_id', jobIds);
    
    // Apply filters if provided
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Order by applied date (newest first)
    query = query.order('applied_date', { ascending: false });
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Apply pagination
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error finding job applications by hiring manager:', error);
      return null;
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  } catch (error) {
    console.error('Error finding job applications by hiring manager:', error);
    return null;
  }
}

/**
 * Find a job application by ID
 */
export async function findJobApplicationById(
  applicationId: string,
  includeJobDetails: boolean = false
): Promise<JobApplication | null> {
  try {
    // Build the select statement
    const select = includeJobDetails 
      ? '*, job:job_id(*)' 
      : '*';
    
    const { data, error } = await supabase
      .from('job_applications')
      .select(select)
      .eq('id', applicationId)
      .single();
    
    if (error) {
      console.error('Error finding job application by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error finding job application by ID:', error);
    return null;
  }
}

/**
 * Create a job application
 */
export async function createJobApplication(applicationData: Partial<JobApplication>): Promise<JobApplication | null> {
  try {
    // Set default values
    const now = new Date().toISOString();
    const application = {
      ...applicationData,
      applied_date: now,
      last_status_update_date: now,
      status: applicationData.status || 'applied'
    };
    
    const { data, error } = await supabase
      .from('job_applications')
      .insert(application)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating job application:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating job application:', error);
    return null;
  }
}

/**
 * Update a job application's status
 */
export async function updateJobApplicationStatus(
  applicationId: string,
  status: string
): Promise<JobApplication | null> {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .update({
        status,
        last_status_update_date: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job application status:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating job application status:', error);
    return null;
  }
}

// ==========================================
// Talent Profile Functions
// ==========================================

/**
 * Get a talent profile by user ID
 */
export async function getTalentProfileWithRelations(userId: string): Promise<TalentProfile | null> {
  try {
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error getting talent profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting talent profile:', error);
    return null;
  }
}

/**
 * Create or update a talent profile
 */
export async function upsertTalentProfile(profileData: Partial<TalentProfile>): Promise<TalentProfile | null> {
  try {
    // Ensure user_id is provided
    if (!profileData.user_id) {
      console.error('User ID is required');
      return null;
    }
    
    // Set updated_at
    const now = new Date().toISOString();
    const profile = {
      ...profileData,
      updated_at: now
    };
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', profileData.user_id)
      .single();
    
    let result;
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('talent_profiles')
        .update(profile)
        .eq('user_id', profileData.user_id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating talent profile:', error);
        return null;
      }
      
      result = data;
      
      // Update user to mark profile as completed
      await supabase
        .from('users')
        .update({
          needs_profile_completion: false,
          updated_at: now
        })
        .eq('id', profileData.user_id);
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('talent_profiles')
        .insert({
          ...profile,
          created_at: now
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating talent profile:', error);
        return null;
      }
      
      result = data;
      
      // Update user to mark profile as completed
      await supabase
        .from('users')
        .update({
          needs_profile_completion: false,
          updated_at: now
        })
        .eq('id', profileData.user_id);
    }
    
    return result;
  } catch (error) {
    console.error('Error upserting talent profile:', error);
    return null;
  }
}

// ==========================================
// Notification Functions
// ==========================================

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    page?: number;
    unreadOnly?: boolean;
  } = {}
): Promise<{
  data: Notification[];
  total: number;
  unreadCount: number;
} | null> {
  try {
    const {
      limit = 10,
      page = 1,
      unreadOnly = false
    } = options;
    
    // Start building the query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply unread filter if needed
    if (unreadOnly) {
      query = query.eq('read', false);
    }
    
    // Order by created_at descending (newest first)
    query = query.order('created_at', { ascending: false });
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Apply pagination
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error getting notifications:', error);
      return null;
    }
    
    // Get unread count
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (countError) {
      console.error('Error counting unread notifications:', countError);
    }
    
    return {
      data: data || [],
      total: count || 0,
      unreadCount: unreadCount || 0
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return null;
  }
}

/**
 * Count unread notifications
 */
export async function countUnreadNotifications(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<Notification | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<{ count: number } | null> {
  try {
    const { data, error, count } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return null;
    }
    
    return { count: count || 0 };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return null;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

// ==========================================
// Analytics Functions
// ==========================================

/**
 * Record a job view
 */
export async function recordJobView(
  jobId: string,
  userId: string,
  action: 'view' | 'application' | 'save' = 'view'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('job_views')
      .insert({
        job_id: jobId,
        user_id: userId,
        action,
        viewed_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error recording job view:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error recording job view:', error);
    return false;
  }
}

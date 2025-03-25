import supabase from './supabase';

/**
 * Track a user event in the analytics system
 * @param userId User ID
 * @param eventType Type of event
 * @param eventData Additional event data
 * @returns True if tracking was successful, false otherwise
 */
export async function trackUserEvent(
  userId: string,
  eventType: string,
  eventData: Record<string, any> = {}
): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_events').insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Error tracking user event:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in trackUserEvent:', error);
    return false;
  }
}

/**
 * Track a job view event
 * @param jobId Job ID
 * @param userId User ID (optional)
 * @returns True if tracking was successful, false otherwise
 */
export async function trackJobView(
  jobId: string,
  userId?: string
): Promise<boolean> {
  try {
    // Increment job view count
    const { error: updateError } = await supabase.rpc('increment_job_view_count', {
      job_id: jobId
    });
    
    if (updateError) {
      console.error('Error incrementing job view count:', updateError);
    }
    
    // Track user event if userId is provided
    if (userId) {
      return await trackUserEvent(userId, 'job_view', { job_id: jobId });
    }
    
    return !updateError;
  } catch (error) {
    console.error('Error in trackJobView:', error);
    return false;
  }
}

/**
 * Track a job application event
 * @param jobId Job ID
 * @param userId User ID
 * @returns True if tracking was successful, false otherwise
 */
export async function trackJobApplication(
  jobId: string,
  userId: string
): Promise<boolean> {
  try {
    // Increment job application count
    const { error: updateError } = await supabase.rpc('increment_job_application_count', {
      job_id: jobId
    });
    
    if (updateError) {
      console.error('Error incrementing job application count:', updateError);
    }
    
    // Track user event
    return await trackUserEvent(userId, 'job_application', { job_id: jobId });
  } catch (error) {
    console.error('Error in trackJobApplication:', error);
    return false;
  }
}

/**
 * Get user activity summary
 * @param userId User ID
 * @returns User activity summary or null if retrieval failed
 */
export async function getUserActivitySummary(
  userId: string
): Promise<any | null> {
  try {
    // Get job views count
    const { data: jobViews, error: jobViewsError } = await supabase
      .from('user_events')
      .select('count')
      .eq('user_id', userId)
      .eq('event_type', 'job_view');
    
    if (jobViewsError) {
      console.error('Error getting job views count:', jobViewsError);
    }
    
    // Get job applications count
    const { data: jobApplications, error: jobApplicationsError } = await supabase
      .from('job_applications')
      .select('count')
      .eq('user_id', userId);
    
    if (jobApplicationsError) {
      console.error('Error getting job applications count:', jobApplicationsError);
    }
    
    // Get saved jobs count
    const { data: savedJobs, error: savedJobsError } = await supabase
      .from('saved_jobs')
      .select('count')
      .eq('user_id', userId);
    
    if (savedJobsError) {
      console.error('Error getting saved jobs count:', savedJobsError);
    }
    
    // Get profile completion percentage
    const { data: profile, error: profileError } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error getting talent profile:', profileError);
    }
    
    // Calculate profile completion percentage
    let profileCompletionPercentage = 0;
    if (profile) {
      const totalFields = Object.keys(profile).length - 3; // Exclude id, user_id, and created_at
      const completedFields = Object.entries(profile).filter(([key, value]) => {
        if (['id', 'user_id', 'created_at', 'updated_at'].includes(key)) {
          return false;
        }
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null && value !== '';
      }).length;
      
      profileCompletionPercentage = Math.round((completedFields / totalFields) * 100);
    }
    
    return {
      jobViewsCount: jobViews?.length || 0,
      jobApplicationsCount: jobApplications?.length || 0,
      savedJobsCount: savedJobs?.length || 0,
      profileCompletionPercentage,
      lastActive: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getUserActivitySummary:', error);
    return null;
  }
}

/**
 * Get job performance metrics
 * @param jobId Job ID
 * @returns Job performance metrics or null if retrieval failed
 */
export async function getJobPerformanceMetrics(
  jobId: string
): Promise<any | null> {
  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (jobError) {
      console.error('Error getting job details:', jobError);
      return null;
    }
    
    // Get application count by status
    const { data: applications, error: applicationsError } = await supabase
      .from('job_applications')
      .select('status')
      .eq('job_id', jobId);
    
    if (applicationsError) {
      console.error('Error getting job applications:', applicationsError);
    }
    
    // Calculate application status counts
    const applicationStatusCounts: Record<string, number> = applications?.reduce((acc: Record<string, number>, app) => {
      const status = app.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return {
      jobId,
      title: job.title,
      company: job.company,
      viewCount: job.view_count || 0,
      applicationCount: job.application_count || 0,
      conversionRate: job.view_count ? (job.application_count / job.view_count) * 100 : 0,
      applicationStatusCounts,
      postedDate: job.posted_date,
      status: job.status
    };
  } catch (error) {
    console.error('Error in getJobPerformanceMetrics:', error);
    return null;
  }
}

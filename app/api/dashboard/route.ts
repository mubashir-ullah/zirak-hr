import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getUserActivitySummary } from '@/lib/analytics';
import { findMatchingJobsForTalent } from '@/lib/jobMatching';

/**
 * GET endpoint to retrieve dashboard data for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user details including role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('Error retrieving user:', userError);
      return NextResponse.json({ error: 'Failed to retrieve user data' }, { status: 500 });
    }
    
    // Get dashboard data based on user role
    if (user.role === 'talent') {
      return await getTalentDashboard(session.user.id);
    } else if (user.role === 'hiring_manager') {
      return await getHiringManagerDashboard(session.user.id);
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error retrieving dashboard data:', error);
    return NextResponse.json({ error: 'Failed to retrieve dashboard data' }, { status: 500 });
  }
}

/**
 * Get dashboard data for talent users
 */
async function getTalentDashboard(userId: string) {
  try {
    // Get talent profile
    const { data: profile, error: profileError } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error retrieving talent profile:', profileError);
      return NextResponse.json({ error: 'Failed to retrieve talent profile' }, { status: 500 });
    }
    
    // Get profile completion percentage
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
    
    // Get recent job applications
    const { data: applications, error: applicationsError } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs:job_id (
          id,
          title,
          company,
          location,
          job_type,
          posted_date
        )
      `)
      .eq('user_id', userId)
      .order('applied_date', { ascending: false })
      .limit(5);
    
    if (applicationsError) {
      console.error('Error retrieving job applications:', applicationsError);
      return NextResponse.json({ error: 'Failed to retrieve job applications' }, { status: 500 });
    }
    
    // Get application counts by status
    const { data: applicationStatusCounts, error: statusError } = await supabase
      .from('job_applications')
      .select('status')
      .eq('user_id', userId);
    
    if (statusError) {
      console.error('Error retrieving application status counts:', statusError);
      return NextResponse.json({ error: 'Failed to retrieve application status counts' }, { status: 500 });
    }
    
    // Calculate application status counts
    const statusCounts: Record<string, number> = {};
    applicationStatusCounts?.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    // Get job matches
    const matches = await findMatchingJobsForTalent(userId, 5, 50);
    
    // Get saved jobs count
    const { count: savedJobsCount, error: savedJobsError } = await supabase
      .from('saved_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (savedJobsError) {
      console.error('Error retrieving saved jobs count:', savedJobsError);
    }
    
    // Get unread notifications count
    const { count: unreadNotificationsCount, error: notificationsError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (notificationsError) {
      console.error('Error retrieving unread notifications count:', notificationsError);
    }
    
    return NextResponse.json({
      profile: profile || null,
      profileCompletionPercentage,
      recentApplications: applications || [],
      applicationStatusCounts: statusCounts,
      jobMatches: matches || [],
      savedJobsCount: savedJobsCount || 0,
      totalApplicationsCount: applicationStatusCounts?.length || 0,
      unreadNotificationsCount: unreadNotificationsCount || 0
    }, { status: 200 });
  } catch (error) {
    console.error('Error in getTalentDashboard:', error);
    return NextResponse.json({ error: 'Failed to retrieve talent dashboard data' }, { status: 500 });
  }
}

/**
 * Get dashboard data for hiring manager users
 */
async function getHiringManagerDashboard(userId: string) {
  try {
    // Get hiring manager profile
    const { data: profile, error: profileError } = await supabase
      .from('hiring_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error retrieving hiring profile:', profileError);
      return NextResponse.json({ error: 'Failed to retrieve hiring profile' }, { status: 500 });
    }
    
    // Get profile completion percentage
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
    
    // Get recent job postings
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('posted_by', userId)
      .order('posted_date', { ascending: false })
      .limit(5);
    
    if (jobsError) {
      console.error('Error retrieving job postings:', jobsError);
      return NextResponse.json({ error: 'Failed to retrieve job postings' }, { status: 500 });
    }
    
    // Get job counts by status
    const { data: jobStatusCounts, error: statusError } = await supabase
      .from('jobs')
      .select('status')
      .eq('posted_by', userId);
    
    if (statusError) {
      console.error('Error retrieving job status counts:', statusError);
      return NextResponse.json({ error: 'Failed to retrieve job status counts' }, { status: 500 });
    }
    
    // Calculate job status counts
    const statusCounts: Record<string, number> = {};
    jobStatusCounts?.forEach(job => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });
    
    // Get recent applications for all jobs posted by this hiring manager
    const { data: recentApplications, error: applicationsError } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs:job_id (
          id,
          title
        ),
        users:user_id (
          id,
          name,
          email
        ),
        talent_profiles:user_id (
          id,
          full_name,
          title,
          profile_picture
        )
      `)
      .in('job_id', jobs?.map(job => job.id) || [])
      .order('applied_date', { ascending: false })
      .limit(5);
    
    if (applicationsError) {
      console.error('Error retrieving recent applications:', applicationsError);
      return NextResponse.json({ error: 'Failed to retrieve recent applications' }, { status: 500 });
    }
    
    // Get total application count
    const { count: totalApplicationsCount, error: totalAppsError } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .in('job_id', jobs?.map(job => job.id) || []);
    
    if (totalAppsError) {
      console.error('Error retrieving total applications count:', totalAppsError);
    }
    
    // Get unread notifications count
    const { count: unreadNotificationsCount, error: notificationsError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (notificationsError) {
      console.error('Error retrieving unread notifications count:', notificationsError);
    }
    
    return NextResponse.json({
      profile: profile || null,
      profileCompletionPercentage,
      recentJobs: jobs || [],
      jobStatusCounts: statusCounts,
      recentApplications: recentApplications || [],
      totalJobsCount: jobStatusCounts?.length || 0,
      totalApplicationsCount: totalApplicationsCount || 0,
      unreadNotificationsCount: unreadNotificationsCount || 0
    }, { status: 200 });
  } catch (error) {
    console.error('Error in getHiringManagerDashboard:', error);
    return NextResponse.json({ error: 'Failed to retrieve hiring manager dashboard data' }, { status: 500 });
  }
}

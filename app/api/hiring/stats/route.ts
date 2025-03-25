import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a hiring manager
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!userData || userData.role !== 'hiring_manager') {
      return NextResponse.json({ error: 'Unauthorized. Only hiring managers can view stats' }, { status: 403 });
    }
    
    // Get jobs posted by this hiring manager
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('posted_by', session.user.id);
    
    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      return NextResponse.json({ error: 'Failed to fetch job statistics' }, { status: 500 });
    }
    
    // Get job applications for these jobs
    const jobIds = jobs.map(job => job.id);
    
    // If no jobs, return empty stats
    if (jobIds.length === 0) {
      return NextResponse.json({
        stats: {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          applicationsByStatus: {},
          applicationsByJob: []
        }
      }, { status: 200 });
    }
    
    const { data: applications, error: applicationsError } = await supabase
      .from('job_applications')
      .select('*')
      .in('job_id', jobIds);
    
    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return NextResponse.json({ error: 'Failed to fetch job statistics' }, { status: 500 });
    }
    
    // Calculate statistics
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = applications.length;
    
    // Applications by status
    const applicationsByStatus = applications.reduce((acc, app) => {
      const status = app.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Applications by job
    const applicationsByJob = jobs.map(job => {
      const jobApplications = applications.filter(app => app.job_id === job.id);
      return {
        jobId: job.id,
        jobTitle: job.title,
        totalApplications: jobApplications.length,
        applicationsByStatus: jobApplications.reduce((acc, app) => {
          const status = app.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      };
    });
    
    return NextResponse.json({
      stats: {
        totalJobs: jobs.length,
        activeJobs,
        totalApplications,
        applicationsByStatus,
        applicationsByJob
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch job statistics' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import { trackJobApplication } from '@/lib/analytics';
import { calculateJobMatchScore } from '@/lib/jobMatching';
import { 
  findJobApplicationsByUserId,
  createJobApplication,
  findJobById,
  findJobApplicationById,
  updateJobApplicationStatus,
  recordJobView
} from '@/lib/database';

/**
 * GET endpoint to retrieve job applications for a talent
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get applications using our database function
    const applications = await findJobApplicationsByUserId(
      session.user.id, 
      { 
        status: status || undefined,
        page,
        limit,
        includeJobDetails: true
      }
    );
    
    if (!applications) {
      return NextResponse.json({ applications: [], total: 0 });
    }
    
    return NextResponse.json({
      applications: applications.data,
      total: applications.total
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

/**
 * POST endpoint to apply for a job
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request data
    const data = await request.json();
    const { jobId, coverLetter, resumeUrl, notes } = data;
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Check if job exists
    const job = await findJobById(jobId);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Check if job is active
    if (job.status !== 'active') {
      return NextResponse.json({ error: 'Job is not active' }, { status: 400 });
    }
    
    // Check if application deadline has passed
    if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
      return NextResponse.json({ error: 'Application deadline has passed' }, { status: 400 });
    }
    
    // Calculate match score
    const matchResult = await calculateJobMatchScore(session.user.id, jobId);
    const matchScore = matchResult ? matchResult.score : 0;
    
    // Create job application using our database function
    const applicationData = {
      job_id: jobId,
      user_id: session.user.id,
      status: 'applied',
      resume_url: resumeUrl || '',
      cover_letter: coverLetter || '',
      notes: notes || '',
      match_score: matchScore
    };
    
    const application = await createJobApplication(applicationData);
    
    if (!application) {
      return NextResponse.json({ error: 'Failed to apply for job' }, { status: 500 });
    }
    
    // Record a job view to track the application in analytics
    await recordJobView(jobId, session.user.id, 'application');
    
    // Track the application
    await trackJobApplication(jobId, session.user.id);
    
    // Create notification for hiring manager
    try {
      await createNotification(
        job.posted_by,
        'New Job Application',
        `You have a new application for "${job.title}"`,
        'new_application',
        `/hiring/applications?jobId=${jobId}`
      );
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification fails
    }
    
    return NextResponse.json({
      message: 'Successfully applied for job',
      application
    }, { status: 201 });
  } catch (error) {
    console.error('Error applying for job:', error);
    return NextResponse.json({ error: 'Failed to apply for job' }, { status: 500 });
  }
}

/**
 * DELETE endpoint to withdraw a job application
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get application ID from query parameters
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');
    
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }
    
    // Get application with job details
    const application = await findJobApplicationById(applicationId, true);
    
    if (!application || application.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Update application status to 'withdrawn'
    const updated = await updateJobApplicationStatus(applicationId, 'withdrawn');
    
    if (!updated) {
      return NextResponse.json({ error: 'Failed to withdraw application' }, { status: 500 });
    }
    
    // Create notification for hiring manager
    try {
      await createNotification(
        application.job.posted_by,
        'Application Withdrawn',
        `An applicant has withdrawn their application for "${application.job.title}"`,
        'application_status_change',
        `/hiring/applications?jobId=${application.job_id}`
      );
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification fails
    }
    
    return NextResponse.json({
      message: 'Successfully withdrew application'
    }, { status: 200 });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return NextResponse.json({ error: 'Failed to withdraw application' }, { status: 500 });
  }
}

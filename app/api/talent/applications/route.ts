import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import { trackJobApplication } from '@/lib/analytics';
import { calculateJobMatchScore } from '@/lib/jobMatching';

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
    
    // Build query
    let query = supabase
      .from('job_applications')
      .select(`
        *,
        jobs:job_id (
          id,
          title,
          company,
          location,
          job_type,
          salary_min,
          salary_max,
          salary_currency,
          remote,
          posted_date,
          application_deadline,
          status
        )
      `)
      .eq('user_id', session.user.id)
      .order('applied_date', { ascending: false });
    
    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    // Execute query
    const { data: applications, error, count } = await query;
    
    if (error) {
      console.error('Error retrieving applications:', error);
      return NextResponse.json({ error: 'Failed to retrieve applications' }, { status: 500 });
    }
    
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    
    if (countError) {
      console.error('Error counting applications:', countError);
    }
    
    return NextResponse.json({
      applications: applications || [],
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving applications:', error);
    return NextResponse.json({ error: 'Failed to retrieve applications' }, { status: 500 });
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
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (jobError || !job) {
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
    
    // Check if user has already applied for this job
    const { data: existingApplication, error: applicationCheckError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', session.user.id)
      .single();
    
    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
    }
    
    // Calculate match score
    const matchResult = await calculateJobMatchScore(session.user.id, jobId);
    const matchScore = matchResult ? matchResult.score : 0;
    
    // Create job application
    const { data: application, error: applicationError } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        user_id: session.user.id,
        status: 'applied',
        applied_date: new Date().toISOString(),
        resume_url: resumeUrl || '',
        cover_letter: coverLetter || '',
        notes: notes || '',
        last_status_update_date: new Date().toISOString(),
        match_score: matchScore
      })
      .select()
      .single();
    
    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return NextResponse.json({ error: 'Failed to apply for job' }, { status: 500 });
    }
    
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
    
    // Check if application exists and belongs to user
    const { data: application, error: applicationCheckError } = await supabase
      .from('job_applications')
      .select('*, jobs:job_id(title, posted_by)')
      .eq('id', applicationId)
      .eq('user_id', session.user.id)
      .single();
    
    if (applicationCheckError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Delete application
    const { error: deleteError } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', applicationId);
    
    if (deleteError) {
      console.error('Error withdrawing application:', deleteError);
      return NextResponse.json({ error: 'Failed to withdraw application' }, { status: 500 });
    }
    
    // Create notification for hiring manager
    try {
      await createNotification(
        application.jobs.posted_by,
        'Application Withdrawn',
        `An applicant has withdrawn their application for "${application.jobs.title}"`,
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

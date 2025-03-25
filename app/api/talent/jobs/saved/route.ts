import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findSavedJobsByUserId, findJobById } from '@/lib/supabaseDb';

export async function GET(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get saved jobs
    const savedJobs = await findSavedJobsByUserId(session.user.id);
    
    if (!savedJobs) {
      return NextResponse.json({ 
        savedJobs: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        }
      }, { status: 200 });
    }
    
    // Sort by saved_date (descending)
    const sortedSavedJobs = [...savedJobs].sort((a, b) => {
      return new Date(b.saved_date).getTime() - new Date(a.saved_date).getTime();
    });
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedSavedJobs = sortedSavedJobs.slice(start, end);
    
    // Get job details for each saved job
    const savedJobsWithJobDetails = await Promise.all(
      paginatedSavedJobs.map(async (savedJob) => {
        const job = await findJobById(savedJob.job_id);
        return {
          ...savedJob,
          job: job || null
        };
      })
    );
    
    return NextResponse.json({
      savedJobs: savedJobsWithJobDetails,
      pagination: {
        total: savedJobs.length,
        page,
        limit,
        pages: Math.ceil(savedJobs.length / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

/**
 * POST endpoint to save a job
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request data
    const data = await req.json();
    const { jobId, notes } = data;
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Check if job exists
    const job = await findJobById(jobId);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Check if job is already saved
    const { data: existingSavedJob, error: checkError } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('job_id', jobId)
      .single();
    
    if (existingSavedJob) {
      return NextResponse.json({ error: 'Job already saved' }, { status: 409 });
    }
    
    // Save the job
    const { data: savedJob, error } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: session.user.id,
        job_id: jobId,
        saved_date: new Date().toISOString(),
        notes: notes || ''
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving job:', error);
      return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
    }
    
    // Track the event
    try {
      await supabase.from('user_events').insert({
        user_id: session.user.id,
        event_type: 'job_saved',
        event_data: { job_id: jobId },
        timestamp: new Date().toISOString()
      });
    } catch (eventError) {
      console.error('Error tracking job save event:', eventError);
      // Continue even if event tracking fails
    }
    
    return NextResponse.json({ 
      message: 'Job saved successfully',
      savedJob 
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
  }
}

/**
 * DELETE endpoint to unsave a job
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get job ID from query parameters
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Delete the saved job
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', session.user.id)
      .eq('job_id', jobId);
    
    if (error) {
      console.error('Error unsaving job:', error);
      return NextResponse.json({ error: 'Failed to unsave job' }, { status: 500 });
    }
    
    // Track the event
    try {
      await supabase.from('user_events').insert({
        user_id: session.user.id,
        event_type: 'job_unsaved',
        event_data: { job_id: jobId },
        timestamp: new Date().toISOString()
      });
    } catch (eventError) {
      console.error('Error tracking job unsave event:', eventError);
      // Continue even if event tracking fails
    }
    
    return NextResponse.json({ 
      message: 'Job unsaved successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error unsaving job:', error);
    return NextResponse.json({ error: 'Failed to unsave job' }, { status: 500 });
  }
}

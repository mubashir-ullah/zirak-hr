import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { createSavedJob, findJobById, deleteSavedJob } from '@/lib/supabaseDb';

export async function POST(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { jobId, notes } = await req.json();
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Check if job exists
    const job = await findJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Check if job is already saved
    const { data: existingSavedJobs } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('job_id', jobId);
    
    if (existingSavedJobs && existingSavedJobs.length > 0) {
      return NextResponse.json({ error: 'Job already saved' }, { status: 400 });
    }
    
    // Save the job
    const now = new Date().toISOString();
    const savedJobData = {
      user_id: session.user.id,
      job_id: jobId,
      saved_date: now.split('T')[0],
      notes: notes || ''
    };
    
    const savedJob = await createSavedJob(savedJobData);
    
    if (!savedJob) {
      return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
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

export async function DELETE(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const savedJobId = searchParams.get('id');
    
    if (!savedJobId) {
      return NextResponse.json({ error: 'Saved job ID is required' }, { status: 400 });
    }
    
    // Check if saved job exists and belongs to the user
    const { data: savedJob } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('id', savedJobId)
      .eq('user_id', session.user.id)
      .single();
    
    if (!savedJob) {
      return NextResponse.json({ error: 'Saved job not found or unauthorized' }, { status: 404 });
    }
    
    // Delete the saved job
    const success = await deleteSavedJob(savedJobId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete saved job' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Job removed from saved jobs successfully' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error removing saved job:', error);
    return NextResponse.json({ error: 'Failed to remove saved job' }, { status: 500 });
  }
}

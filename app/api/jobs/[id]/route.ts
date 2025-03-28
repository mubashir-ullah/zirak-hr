import { NextResponse } from 'next/server';
import { findJobById, updateJob, deleteJob } from '@/lib/database';
import supabase from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

// GET /api/jobs/[id] - Get a specific job
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    const job = await findJobById(id);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Update a specific job
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the job to check ownership
    const existingJob = await findJobById(id);
    
    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the owner of the job or an admin
    if (existingJob.posted_by !== session.user.id && session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to update this job' },
        { status: 403 }
      );
    }
    
    // Get the updated job data
    const jobData = await request.json();
    
    // Check if status is changing from draft to active
    const isActivating = existingJob.status !== 'active' && jobData.status === 'active';
    
    // Set the posted_date if the job is being activated
    if (isActivating) {
      jobData.posted_date = new Date().toISOString().split('T')[0];
    }
    
    // Update the job
    const updatedJob = await updateJob(id, {
      ...jobData,
      updated_at: new Date().toISOString()
    });
    
    if (!updatedJob) {
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }
    
    // If the job was activated, create notifications for matching talent
    if (isActivating) {
      try {
        // This would be implemented in a real system to notify matching talent
        console.log('Job activated, would notify matching talent');
      } catch (notifyError) {
        console.error('Error notifying talent:', notifyError);
        // Continue anyway
      }
    }
    
    return NextResponse.json({
      message: 'Job updated successfully',
      job: updatedJob
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete a specific job
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the job to check ownership
    const existingJob = await findJobById(id);
    
    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the owner of the job or an admin
    if (existingJob.posted_by !== session.user.id && session.user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this job' },
        { status: 403 }
      );
    }
    
    // Delete the job
    const success = await deleteJob(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Job deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

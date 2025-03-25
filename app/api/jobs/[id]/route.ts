import { NextResponse } from 'next/server';
import { findJobById, updateJob } from '@/lib/supabaseDb';
import supabase from '@/lib/supabase';

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
    
    // Check if job exists
    const existingJob = await findJobById(id);
    
    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Get update data from request
    const updateData = await request.json();
    
    // Validate required fields
    if (!updateData.title || !updateData.department || !updateData.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Update the job
    const updatedJob = await updateJob(id, {
      ...updateData,
      updated_at: new Date().toISOString()
    });
    
    if (!updatedJob) {
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedJob, { status: 200 });
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
    
    // Check if job exists
    const existingJob = await findJobById(id);
    
    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Delete the job
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json(
        { error: 'Failed to delete job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Job deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

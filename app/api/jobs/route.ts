import { NextResponse } from 'next/server';
import { getAllJobs, createJob, updateJobs } from '@/lib/supabaseDb';

// GET /api/jobs - Get all jobs
export async function GET(request: Request) {
  try {
    const { jobs, error } = await getAllJobs();
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: Request) {
  try {
    const jobData = await request.json();
    
    // Validate required fields
    if (!jobData.title || !jobData.department || !jobData.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Set default values
    const now = new Date();
    const newJob = {
      ...jobData,
      posted_date: jobData.status === 'active' ? now.toISOString().split('T')[0] : '',
      applicants: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    const { job, error } = await createJob(newJob);
    
    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs - Update all jobs (bulk update)
export async function PUT(request: Request) {
  try {
    const jobsData = await request.json();
    
    if (!Array.isArray(jobsData) || jobsData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid jobs data. Expected non-empty array.' },
        { status: 400 }
      );
    }
    
    // Update all jobs in Supabase
    const { success, error } = await updateJobs(jobsData);
    
    if (error) {
      console.error('Error updating jobs:', error);
      return NextResponse.json(
        { error: 'Failed to update jobs' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Jobs updated successfully', count: jobsData.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating jobs:', error);
    return NextResponse.json(
      { error: 'Failed to update jobs' },
      { status: 500 }
    );
  }
}

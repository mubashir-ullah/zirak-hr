import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import SavedJob from '@/models/SavedJob';
import Job from '@/models/Job';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoose();
    
    const { jobId, notes } = await req.json();
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Check if job is already saved
    const existingSavedJob = await SavedJob.findOne({
      userId: session.user.id,
      jobId
    });
    
    if (existingSavedJob) {
      return NextResponse.json({ error: 'Job already saved' }, { status: 400 });
    }
    
    // Save the job
    const savedJob = new SavedJob({
      userId: session.user.id,
      jobId,
      savedDate: new Date(),
      notes: notes || ''
    });
    
    await savedJob.save();
    
    return NextResponse.json({ 
      message: 'Job saved successfully',
      savedJob
    });
  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoose();
    
    const searchParams = req.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Delete the saved job
    const result = await SavedJob.findOneAndDelete({
      userId: session.user.id,
      jobId
    });
    
    if (!result) {
      return NextResponse.json({ error: 'Saved job not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Job removed from saved jobs'
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    return NextResponse.json({ error: 'Failed to remove saved job' }, { status: 500 });
  }
}

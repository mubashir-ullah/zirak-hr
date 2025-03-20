import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/jobs/[id]/interviews - Get all interviews for a job
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const job = await db.collection('jobs').findOne(
      { _id: new ObjectId(jobId) },
      { projection: { interviews: 1 } }
    );
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(job.interviews || [], { status: 200 });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

// POST /api/jobs/[id]/interviews - Add a new interview for a job
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    const interviewData = await request.json();
    
    // Validate required fields
    if (!interviewData.candidateName || !interviewData.date || !interviewData.time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if job exists
    const job = await db.collection('jobs').findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Create new interview with generated ID
    const newInterview = {
      id: new ObjectId().toString(),
      ...interviewData,
      createdAt: new Date()
    };
    
    // Add interview to job
    const result = await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { 
        $push: { interviews: newInterview },
        $set: { updatedAt: new Date() }
      }
    );
    
    return NextResponse.json(
      newInterview,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}

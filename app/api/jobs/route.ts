import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/jobs - Get all jobs
export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const jobs = await db.collection('jobs').find({}).toArray();
    
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
      postedDate: jobData.status === 'active' ? now.toISOString().split('T')[0] : '',
      applicants: 0,
      createdAt: now,
      updatedAt: now
    };
    
    const { db } = await connectToDatabase();
    const result = await db.collection('jobs').insertOne(newJob);
    
    return NextResponse.json(
      { ...newJob, _id: result.insertedId },
      { status: 201 }
    );
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
    const { jobs } = await request.json();
    
    if (!Array.isArray(jobs)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const operations = jobs.map(job => {
      const { _id, ...updateData } = job;
      return {
        updateOne: {
          filter: { _id: new ObjectId(_id) },
          update: { 
            $set: { 
              ...updateData,
              updatedAt: new Date()
            } 
          }
        }
      };
    });
    
    await db.collection('jobs').bulkWrite(operations);
    
    return NextResponse.json(
      { message: 'Jobs updated successfully' },
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

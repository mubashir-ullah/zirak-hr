import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/jobs/[id]/interviews/[interviewId] - Get a specific interview
export async function GET(
  request: Request,
  { params }: { params: { id: string, interviewId: string } }
) {
  try {
    const { id, interviewId } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const job = await db.collection('jobs').findOne(
      { _id: new ObjectId(id) },
      { projection: { interviews: { $elemMatch: { id: interviewId } } } }
    );
    
    if (!job || !job.interviews || job.interviews.length === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(job.interviews[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id]/interviews/[interviewId] - Update a specific interview
export async function PUT(
  request: Request,
  { params }: { params: { id: string, interviewId: string } }
) {
  try {
    const { id, interviewId } = params;
    
    if (!ObjectId.isValid(id)) {
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
    
    // Update the interview
    const result = await db.collection('jobs').updateOne(
      { 
        _id: new ObjectId(id),
        'interviews.id': interviewId
      },
      { 
        $set: { 
          'interviews.$': {
            ...interviewData,
            id: interviewId, // Preserve the original ID
            updatedAt: new Date()
          },
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Interview updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id]/interviews/[interviewId] - Delete a specific interview
export async function DELETE(
  request: Request,
  { params }: { params: { id: string, interviewId: string } }
) {
  try {
    const { id, interviewId } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Remove the interview from the job
    const result = await db.collection('jobs').updateOne(
      { _id: new ObjectId(id) },
      { 
        $pull: { interviews: { id: interviewId } },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Interview deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview' },
      { status: 500 }
    );
  }
}

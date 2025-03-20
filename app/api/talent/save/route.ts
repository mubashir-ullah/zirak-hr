import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const { candidateId, userId } = body;
    
    if (!candidateId || !userId) {
      return NextResponse.json(
        { error: 'Candidate ID and User ID are required' },
        { status: 400 }
      );
    }
    
    // Check if the candidate exists
    // Try to find by string ID first (for our mock data)
    let candidate = await db.collection('candidates').findOne({ id: candidateId });
    
    // If not found, try with MongoDB ObjectId (for real data)
    if (!candidate) {
      try {
        candidate = await db.collection('candidates').findOne({ _id: new ObjectId(candidateId) });
      } catch (error) {
        // Invalid ObjectId format, continue with null candidate
        console.error('Invalid ObjectId format:', error);
      }
    }
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    // Check if the candidate is already saved
    const existingSave = await db.collection('savedCandidates').findOne({
      candidateId,
      userId
    });
    
    if (existingSave) {
      return NextResponse.json(
        { message: 'Candidate already saved', alreadySaved: true },
        { status: 200 }
      );
    }
    
    // Save the candidate
    await db.collection('savedCandidates').insertOne({
      candidateId,
      userId,
      savedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Candidate saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving candidate:', error);
    return NextResponse.json(
      { error: 'Failed to save candidate' },
      { status: 500 }
    );
  }
}

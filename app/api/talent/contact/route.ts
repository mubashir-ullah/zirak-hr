import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const { candidateId, userId, message } = body;
    
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
    
    // Save the contact request
    await db.collection('contactRequests').insertOne({
      candidateId,
      userId,
      message: message || 'I would like to discuss a potential opportunity with you.',
      status: 'pending',
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Contact request sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending contact request:', error);
    return NextResponse.json(
      { error: 'Failed to send contact request' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { candidateId: string } }
) {
  try {
    const { candidateId } = params;
    
    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
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
    
    // In a real implementation, this would generate a PDF resume or return a file URL
    // For now, we'll just return a success message with download info
    
    return NextResponse.json({
      success: true,
      message: 'Resume download initiated',
      fileName: `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`,
      // In a real app, this would be a temporary download URL
      downloadUrl: `/api/talent/resume/${candidateId}/download`
    });
    
  } catch (error) {
    console.error('Error downloading resume:', error);
    return NextResponse.json(
      { error: 'Failed to download resume' },
      { status: 500 }
    );
  }
}

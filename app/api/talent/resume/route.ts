import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { findResumeByUserId, updateResume } from '@/app/models/resume';

// GET endpoint to retrieve the talent's resume
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const db = await connectToDatabase();
    
    // Find resume by user ID
    const resume = await findResumeByUserId(db, userData.id);
    
    return NextResponse.json({ 
      resume,
      message: resume ? 'Resume retrieved successfully' : 'No resume found for this user'
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT endpoint to update the talent's resume
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const resumeData = await request.json();
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Find resume by user ID to check if it exists
    const existingResume = await findResumeByUserId(db, userData.id);
    
    if (!existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    // Update resume
    const updatedResume = await updateResume(db, userData.id, resumeData);
    
    return NextResponse.json({ 
      resume: updatedResume,
      message: 'Resume updated successfully'
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

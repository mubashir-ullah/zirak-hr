import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth';
import { findResumeByUserId, updateResumeSharing } from '@/app/models/resume';

// POST endpoint to update resume sharing settings
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { isPublic, expiryDays = 30 } = body;
    
    if (typeof isPublic !== 'boolean') {
      return NextResponse.json({ error: 'isPublic must be a boolean' }, { status: 400 });
    }
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Check if user has a resume
    const existingResume = await findResumeByUserId(db, userData.id);
    if (!existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    // Update resume sharing settings
    const updatedResume = await updateResumeSharing(db, userData.id, isPublic, expiryDays);
    
    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareableUrl = `${baseUrl}/resume/${updatedResume.shareableLink}`;
    
    return NextResponse.json({ 
      isPublic: updatedResume.isPublic,
      shareableLink: updatedResume.shareableLink,
      shareableUrl,
      shareExpiry: updatedResume.shareExpiry,
      message: isPublic ? 'Resume sharing enabled' : 'Resume sharing disabled'
    });
  } catch (error) {
    console.error('Error updating resume sharing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to get resume sharing settings
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Check if user has a resume
    const resume = await findResumeByUserId(db, userData.id);
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareableUrl = `${baseUrl}/resume/${resume.shareableLink}`;
    
    return NextResponse.json({ 
      isPublic: resume.isPublic,
      shareableLink: resume.shareableLink,
      shareableUrl,
      shareExpiry: resume.shareExpiry
    });
  } catch (error) {
    console.error('Error getting resume sharing settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

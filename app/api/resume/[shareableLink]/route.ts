import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { findResumeByShareableLink } from '@/app/models/resume';

// GET endpoint to retrieve a shared resume by its shareable link
export async function GET(
  request: NextRequest,
  { params }: { params: { shareableLink: string } }
) {
  try {
    const { shareableLink } = params;
    
    if (!shareableLink) {
      return NextResponse.json({ error: 'Shareable link is required' }, { status: 400 });
    }
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Find resume by shareable link
    const resume = await findResumeByShareableLink(db, shareableLink);
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found or link has expired' }, { status: 404 });
    }
    
    // Return resume data (excluding sensitive information)
    const publicResumeData = {
      fullName: resume.fullName,
      summary: resume.summary,
      skills: resume.skills,
      education: resume.education,
      experience: resume.experience,
      projects: resume.projects,
      certifications: resume.certifications,
      languages: resume.languages,
      pdfUrl: resume.pdfUrl,
    };
    
    return NextResponse.json({ 
      resume: publicResumeData,
      message: 'Resume retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching shared resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

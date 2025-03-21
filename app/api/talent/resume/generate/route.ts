import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth';
import { findResumeByUserId, createResume, updateResume } from '@/app/models/resume';
import { findProfileByUserId } from '@/app/models/talentProfile';
import axios from 'axios';
import * as uuid from 'uuid';
import path from 'path';
import { writeFile } from 'fs/promises';

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST endpoint to generate a resume using AI
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { template = 'professional', customPrompt = '' } = body;
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Get user profile data
    const profile = await findProfileByUserId(db, userData.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    // Check if user already has a resume
    const existingResume = await findResumeByUserId(db, userData.id);
    
    // Prepare data for AI service
    const profileData = {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      skills: profile.skills,
      summary: profile.bio,
      experience: profile.experience,
      education: profile.education,
      country: profile.country,
      city: profile.city,
      germanLevel: profile.germanLevel,
      visaRequired: profile.visaRequired,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      portfolioUrl: profile.portfolioUrl,
      customPrompt,
      template
    };
    
    // Call AI service to generate resume
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/generate-resume/`, profileData);
    
    if (!aiResponse.data) {
      throw new Error('Failed to generate resume');
    }
    
    // Extract generated data
    const generatedData = aiResponse.data;
    
    // Generate PDF file
    const pdfResponse = await axios.post(
      `${AI_SERVICE_URL}/generate-resume-pdf/`,
      { resumeData: generatedData, template },
      { responseType: 'arraybuffer' }
    );
    
    // Save PDF file
    const fileName = `${uuid.v4()}.pdf`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await writeFile(filePath, Buffer.from(pdfResponse.data));
    
    // Generate public URL for the file
    const fileUrl = `/uploads/resumes/${fileName}`;
    
    // Prepare resume data
    const resumeData = {
      userId: userData.id,
      fullName: generatedData.fullName || profile.fullName,
      email: generatedData.email || profile.email,
      phone: generatedData.phone || profile.phone,
      summary: generatedData.summary || profile.bio,
      skills: generatedData.skills || profile.skills,
      education: generatedData.education || [],
      experience: generatedData.experience || [],
      projects: generatedData.projects || [],
      certifications: generatedData.certifications || [],
      languages: generatedData.languages || [],
      pdfUrl: fileUrl,
    };
    
    // Create or update resume
    let resume;
    if (existingResume) {
      resume = await updateResume(db, userData.id, resumeData);
    } else {
      resume = await createResume(db, resumeData);
    }
    
    return NextResponse.json({ 
      resume,
      generatedData,
      message: 'Resume generated successfully'
    });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

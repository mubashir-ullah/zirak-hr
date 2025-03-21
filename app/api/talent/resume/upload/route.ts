import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth';
import { findResumeByUserId, createResume, updateResume } from '@/app/models/resume';
import { findProfileByUserId, updateProfile } from '@/app/models/talentProfile';
import { writeFile } from 'fs/promises';
import path from 'path';
import * as uuid from 'uuid';
import axios from 'axios';

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST endpoint to upload and parse a resume
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data (multipart/form-data)
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    
    if (!resumeFile) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }
    
    // Validate file type
    const fileType = resumeFile.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'docx') {
      return NextResponse.json({ error: 'Invalid file type. Only PDF and DOCX files are supported.' }, { status: 400 });
    }
    
    // Validate file size (max 5MB)
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }
    
    // Generate unique filename
    const fileName = `${uuid.v4()}.${fileType}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Save file to disk
    const fileBuffer = await resumeFile.arrayBuffer();
    await writeFile(filePath, Buffer.from(fileBuffer));
    
    // Generate public URL for the file
    const fileUrl = `/uploads/resumes/${fileName}`;
    
    // Send file to AI service for parsing
    const aiFormData = new FormData();
    aiFormData.append('file', resumeFile);
    
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/parse-resume/`, aiFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!aiResponse.data) {
      throw new Error('Failed to parse resume');
    }
    
    // Extract parsed data
    const parsedData = aiResponse.data;
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Check if user already has a resume
    const existingResume = await findResumeByUserId(db, userData.id);
    
    // Prepare resume data
    const resumeData = {
      userId: userData.id,
      fullName: parsedData.fullName || '',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      summary: parsedData.summary || '',
      skills: parsedData.skills || [],
      education: parsedData.education || [],
      experience: parsedData.workExperience || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      languages: parsedData.languages || [],
      pdfUrl: fileUrl,
    };
    
    // Create or update resume
    let resume;
    if (existingResume) {
      resume = await updateResume(db, userData.id, resumeData);
    } else {
      resume = await createResume(db, resumeData);
    }
    
    // Update user profile with relevant information
    const profile = await findProfileByUserId(db, userData.id);
    if (profile) {
      const profileUpdateData = {
        fullName: parsedData.fullName || profile.fullName,
        skills: [...new Set([...profile.skills, ...(parsedData.skills || [])])],
        germanLevel: parsedData.germanLevel || profile.germanLevel,
        country: parsedData.country || profile.country,
        city: parsedData.city || profile.city,
        resumeUrl: fileUrl,
      };
      
      await updateProfile(db, userData.id, profileUpdateData);
    }
    
    // Get skill suggestions from AI service
    let suggestedSkills = [];
    try {
      const skillResponse = await axios.post(`${AI_SERVICE_URL}/suggest-skills/`, {
        resumeText: parsedData.resumeText,
        skills: parsedData.skills || [],
      });
      
      if (skillResponse.data && skillResponse.data.skills) {
        suggestedSkills = skillResponse.data.skills;
      }
    } catch (error) {
      console.error('Error getting skill suggestions:', error);
      // Continue without skill suggestions
    }
    
    return NextResponse.json({ 
      resume,
      parsedData,
      suggestedSkills,
      message: 'Resume uploaded and parsed successfully'
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth';
import { findResumeByUserId, createResume, updateResume } from '@/app/models/resume';
import { findProfileByUserId, updateProfile } from '@/app/models/talentProfile';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { writeFile } from 'fs/promises';

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'resumes');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

// POST endpoint to import resume from LinkedIn
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { accessToken } = body;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'LinkedIn access token is required' }, { status: 400 });
    }
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Get user profile
    const profile = await findProfileByUserId(db, userData.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    // Fetch LinkedIn profile data
    const profileResponse = await axios.get(`${LINKEDIN_API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    const profileId = profileResponse.data.id;
    
    // Fetch profile details
    const profileDetailsResponse = await axios.get(
      `${LINKEDIN_API_URL}/people/${profileId}?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline,summary,skills,positions,educations,languages,certifications,email)`, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    
    const profileData = profileDetailsResponse.data;
    
    // Transform LinkedIn data to our resume format
    const firstName = profileData.firstName?.localized?.en_US || '';
    const lastName = profileData.lastName?.localized?.en_US || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Extract skills
    const skills = profileData.skills?.elements?.map(skill => 
      skill.skill?.name?.localized?.en_US || ''
    ).filter(Boolean) || [];
    
    // Extract experience
    const experience = profileData.positions?.elements?.map(position => {
      const startDate = position.startDate ? 
        `${position.startDate.month}/${position.startDate.year}` : '';
      const endDate = position.endDate ? 
        `${position.endDate.month}/${position.endDate.year}` : '';
      
      return {
        title: position.title?.localized?.en_US || '',
        company: position.companyName?.localized?.en_US || '',
        location: position.location?.localized?.en_US || '',
        startDate,
        endDate: position.isCurrent ? '' : endDate,
        description: position.description?.localized?.en_US || ''
      };
    }) || [];
    
    // Extract education
    const education = profileData.educations?.elements?.map(edu => {
      const startDate = edu.startDate ? `${edu.startDate.year}` : '';
      const endDate = edu.endDate ? `${edu.endDate.year}` : '';
      
      return {
        degree: edu.degreeName?.localized?.en_US || '',
        institution: edu.schoolName?.localized?.en_US || '',
        location: '',
        startDate,
        endDate,
        description: edu.description?.localized?.en_US || ''
      };
    }) || [];
    
    // Extract certifications
    const certifications = profileData.certifications?.elements?.map(cert => {
      return {
        name: cert.name?.localized?.en_US || '',
        issuer: cert.authority?.localized?.en_US || '',
        date: cert.issueDate ? `${cert.issueDate.month}/${cert.issueDate.year}` : ''
      };
    }) || [];
    
    // Extract languages
    const languages = profileData.languages?.elements?.map(lang => {
      return {
        name: lang.name?.localized?.en_US || '',
        proficiency: lang.proficiency?.level || 'Conversational'
      };
    }) || [];
    
    // Generate PDF using AI service
    const resumeData = {
      fullName,
      email: profile.email,
      phone: profile.phone || '',
      summary: profileData.summary?.localized?.en_US || '',
      skills,
      education,
      experience,
      certifications,
      languages,
      projects: []
    };
    
    // Call AI service to generate PDF
    const pdfResponse = await axios.post(
      `${AI_SERVICE_URL}/generate-resume-pdf/`,
      { resumeData, template: 'professional' },
      { responseType: 'arraybuffer' }
    );
    
    // Save PDF file
    const fileName = `${uuidv4()}.pdf`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await writeFile(filePath, Buffer.from(pdfResponse.data));
    
    // Generate public URL for the file
    const fileUrl = `/uploads/resumes/${fileName}`;
    
    // Check if user already has a resume
    const existingResume = await findResumeByUserId(db, userData.id);
    
    // Create or update resume
    let resume;
    if (existingResume) {
      resume = await updateResume(db, userData.id, {
        ...resumeData,
        pdfUrl: fileUrl
      });
    } else {
      resume = await createResume(db, {
        userId: userData.id,
        ...resumeData,
        pdfUrl: fileUrl
      });
    }
    
    // Update user profile with relevant information
    await updateProfile(db, userData.id, {
      fullName,
      skills: [...new Set([...profile.skills, ...skills])],
      linkedinUrl: profile.linkedinUrl || `https://www.linkedin.com/in/${profileId}`,
      resumeUrl: fileUrl
    });
    
    return NextResponse.json({ 
      resume,
      message: 'Resume imported from LinkedIn successfully'
    });
  } catch (error) {
    console.error('Error importing LinkedIn resume:', error);
    
    // Check for specific LinkedIn API errors
    if (error.response && error.response.status === 401) {
      return NextResponse.json({ 
        error: 'LinkedIn authentication failed. Please reconnect your LinkedIn account.' 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to import resume from LinkedIn. Please try again later.' 
    }, { status: 500 });
  }
}

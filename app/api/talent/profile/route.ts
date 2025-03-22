import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { createOrUpdateProfile, findProfileByUserId } from '@/app/models/talentProfile';
import mongoose from 'mongoose';

// GET endpoint to retrieve talent profile
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const db = await connectToDatabase();
    
    // Retrieve profile data
    const profile = await findProfileByUserId(db, userData.id);
    
    if (!profile) {
      return NextResponse.json({ 
        profile: {
          fullName: '',
          email: '',
          skills: [],
          experience: '',
          country: '',
          city: '',
          germanLevel: '',
          availability: '',
          visaRequired: false,
          visaType: '',
          linkedinUrl: '',
          githubUrl: '',
          bio: '',
          profilePicture: '',
          resumeUrl: '',
          title: '',
          phone: '',
          education: [],
          preferredJobTypes: [],
          preferredLocations: [],
          languages: []
        }
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching talent profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to create or update talent profile
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['fullName', 'email', 'country', 'city', 'experience', 'germanLevel', 'availability'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Sanitize and prepare data
    const profileData = {
      fullName: data.fullName,
      email: data.email,
      skills: Array.isArray(data.skills) ? data.skills : [],
      experience: data.experience,
      country: data.country,
      city: data.city,
      germanLevel: data.germanLevel,
      availability: data.availability,
      visaRequired: Boolean(data.visaRequired),
      visaType: data.visaType || '',
      linkedinUrl: data.linkedinUrl || '',
      githubUrl: data.githubUrl || '',
      bio: data.bio || '',
      profilePicture: data.profilePicture || '',
      resumeUrl: data.resumeUrl || '',
      title: data.title || '',
      phone: data.phone || '',
      education: Array.isArray(data.education) ? data.education : [],
      preferredJobTypes: Array.isArray(data.preferredJobTypes) ? data.preferredJobTypes : [],
      preferredLocations: Array.isArray(data.preferredLocations) ? data.preferredLocations : [],
      languages: Array.isArray(data.languages) ? data.languages : []
    };
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Create or update profile
    const profile = await createOrUpdateProfile(db, userData.id, profileData);
    
    return NextResponse.json({ 
      message: 'Profile updated successfully', 
      profile 
    });
  } catch (error) {
    console.error('Error updating talent profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

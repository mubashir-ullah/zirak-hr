import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { findUserVerifiedSkills } from '@/app/models/skillTest';
import { ObjectId } from 'mongodb';

// GET endpoint to retrieve a user's verified skills
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get verified skills
    const verifiedSkills = await findUserVerifiedSkills(db, userData.id);
    
    // Get user profile to check if verified skills are already added
    const user = await db.collection('users').findOne({ _id: new ObjectId(userData.id) });
    
    return NextResponse.json({
      verifiedSkills,
      userVerifiedSkills: user?.verifiedSkills || []
    });
  } catch (error) {
    console.error('Error retrieving verified skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to update resume with verified skills
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skillId } = await request.json();
    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get the verified skill
    const verifiedSkill = await db.collection('verifiedskills').findOne({
      _id: new ObjectId(skillId),
      userId: new ObjectId(userData.id)
    });
    
    if (!verifiedSkill) {
      return NextResponse.json({ error: 'Verified skill not found' }, { status: 404 });
    }
    
    // Update user's resume with verified skill
    const resume = await db.collection('resumes').findOne({ userId: new ObjectId(userData.id) });
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    // Check if the skill already exists in the resume
    const skillExists = resume.skills.some((skill: string) => 
      skill.toLowerCase() === verifiedSkill.skill.toLowerCase()
    );
    
    if (!skillExists) {
      // Add the skill to the resume if it doesn't exist
      await db.collection('resumes').updateOne(
        { userId: new ObjectId(userData.id) },
        { $push: { skills: verifiedSkill.skill } }
      );
    }
    
    // Update the user's verifiedSkills array
    await db.collection('users').updateOne(
      { _id: new ObjectId(userData.id) },
      { $addToSet: { verifiedSkills: verifiedSkill.skill } }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Resume updated with verified skill',
      skill: verifiedSkill.skill
    });
  } catch (error) {
    console.error('Error updating resume with verified skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

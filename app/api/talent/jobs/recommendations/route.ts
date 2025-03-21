import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth';
import { findProfileByUserId } from '@/app/models/talentProfile';
import { findJobsBySkills, findJobs } from '@/app/models/job';

// GET endpoint to retrieve job recommendations for the talent
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const db = await connectToDatabase();
    
    // Get the talent's profile to access their skills
    const profile = await findProfileByUserId(db, userData.id);
    
    let recommendedJobs = [];
    
    // If the user has skills, find jobs that match those skills
    if (profile && profile.skills && profile.skills.length > 0) {
      recommendedJobs = await findJobsBySkills(db, profile.skills);
    } else {
      // If no skills are found, return recent jobs
      recommendedJobs = await findJobs(db, {}, 10);
    }

    // Add a match score to each job based on skill overlap
    const jobsWithScore = recommendedJobs.map(job => {
      let matchScore = 0;
      
      if (profile && profile.skills && profile.skills.length > 0) {
        // Calculate match score based on skill overlap
        const userSkills = new Set(profile.skills);
        const jobSkills = new Set(job.skills);
        
        // Count matching skills
        const matchingSkills = [...userSkills].filter(skill => jobSkills.has(skill));
        
        // Calculate score as percentage of matching skills
        matchScore = Math.round((matchingSkills.length / jobSkills.size) * 100);
      }
      
      // Add additional factors to the match score
      if (job.germanRequired === profile?.germanLevel) {
        matchScore += 10;
      }
      
      if (job.location === profile?.city || job.location === profile?.country) {
        matchScore += 10;
      }
      
      // Cap the score at 100
      matchScore = Math.min(matchScore, 100);
      
      return {
        ...job.toObject(),
        matchScore
      };
    });
    
    // Sort by match score (highest first)
    jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ 
      recommendations: jobsWithScore,
      message: 'Job recommendations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching job recommendations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

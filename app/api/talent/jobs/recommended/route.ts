import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';
import SavedJob from '@/models/SavedJob';
import JobApplication from '@/models/JobApplication';
import mongoose from 'mongoose';
import { findProfileByUserId } from '@/app/models/talentProfile';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to the database
    await connectToMongoose();
    const db = await connectToDatabase();

    // Get the user's profile to extract skills and preferences
    const profile = await findProfileByUserId(db, session.user.id);
    
    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Extract user skills and preferences
    const userSkills = profile.skills ? profile.skills.map(skill => typeof skill === 'string' ? skill : skill.name) : [];
    const userPreferredLocations = profile.preferredLocations || [];
    const userPreferredJobTypes = profile.preferredJobTypes || [];
    const userExperience = profile.experience || '';
    const userVisaRequired = profile.visaRequired || false;

    // Get already applied and saved jobs to exclude them
    const appliedJobs = await JobApplication.find({ userId: session.user.id }).select('jobId');
    const savedJobs = await SavedJob.find({ userId: session.user.id }).select('jobId');
    
    const appliedJobIds = appliedJobs.map(app => app.jobId);
    const savedJobIds = savedJobs.map(saved => saved.jobId);
    
    // Combine both arrays to exclude from recommendations
    const excludedJobIds = [...appliedJobIds, ...savedJobIds];

    // Build the query for job recommendations
    let query: any = {
      status: 'active',
      _id: { $nin: excludedJobIds }
    };

    // If user needs visa sponsorship, filter for jobs that offer it
    if (userVisaRequired) {
      query.visaSponsorship = true;
    }

    // Map experience level to job experience requirements
    if (userExperience) {
      let experienceLevel;
      if (userExperience.includes('Less than 1 year')) {
        experienceLevel = 'entry';
      } else if (userExperience.includes('1-2 years')) {
        experienceLevel = 'junior';
      } else if (userExperience.includes('3-5 years')) {
        experienceLevel = 'mid-level';
      } else if (userExperience.includes('6-10 years')) {
        experienceLevel = 'senior';
      } else if (userExperience.includes('More than 10 years')) {
        experienceLevel = 'lead';
      }
      
      if (experienceLevel) {
        query.experienceLevel = experienceLevel;
      }
    }

    // Find jobs that match the user's skills and preferences
    const jobs = await Job.find(query)
      .limit(20)
      .lean();

    // Calculate match score for each job based on skills, location, and job type
    const scoredJobs = jobs.map(job => {
      let score = 0;
      
      // Score based on skill matches (highest weight)
      const userSkillsSet = new Set(userSkills.map((skill: any) => 
        typeof skill === 'string' ? skill.toLowerCase() : skill.name.toLowerCase()
      ));
      
      const jobSkills = job.skills || [];
      const matchedSkills = jobSkills.filter(skill => 
        userSkillsSet.has(skill.toLowerCase())
      );
      
      // Each matched skill adds 10 points
      score += matchedSkills.length * 10;
      
      // Score based on location match (medium weight)
      if (userPreferredLocations.length > 0) {
        const locationMatch = userPreferredLocations.some(loc => 
          job.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (locationMatch) score += 20;
      }
      
      // Score based on job type match (medium weight)
      if (userPreferredJobTypes.length > 0) {
        const jobTypeMatch = userPreferredJobTypes.some(type => 
          job.jobType.toLowerCase().includes(type.toLowerCase())
        );
        if (jobTypeMatch) score += 15;
      }
      
      // Score based on remote preference (if user has remote in preferred locations)
      if (userPreferredLocations.some(loc => loc.toLowerCase().includes('remote')) && job.remote) {
        score += 15;
      }
      
      // Calculate match percentage (max score would be if all skills match + location + job type)
      const maxPossibleScore = Math.max(jobSkills.length, userSkillsSet.size) * 10 + 20 + 15;
      const matchPercentage = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;
      
      return {
        ...job,
        matchScore: score,
        matchPercentage: Math.min(matchPercentage, 100), // Cap at 100%
        matchedSkills: matchedSkills.length
      };
    });

    // Sort by match score (descending)
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ 
      jobs: scoredJobs,
      count: scoredJobs.length
    });
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch recommended jobs' }, { status: 500 });
  }
}

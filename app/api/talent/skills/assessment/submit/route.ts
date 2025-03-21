import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import SkillAssessment from '@/app/models/skillAssessment';
import TalentProfile from '@/app/models/talentProfile';
import SkillAnalytics from '@/app/models/skillAnalytics';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Validate request body
    if (!body.assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Answers must be provided as an array' },
        { status: 400 }
      );
    }
    
    if (typeof body.timeSpent !== 'number') {
      return NextResponse.json(
        { error: 'Time spent must be provided as a number (in seconds)' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Find the assessment
    const assessment = await SkillAssessment.findOne({
      _id: new mongoose.Types.ObjectId(body.assessmentId),
      userId: new mongoose.Types.ObjectId(userId)
    });
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found or not authorized' },
        { status: 404 }
      );
    }
    
    if (assessment.status === 'completed') {
      return NextResponse.json(
        { error: 'Assessment has already been completed' },
        { status: 400 }
      );
    }
    
    if (assessment.status === 'expired') {
      return NextResponse.json(
        { error: 'Assessment has expired' },
        { status: 400 }
      );
    }
    
    // Complete the assessment and calculate the score
    const result = await assessment.completeAssessment(body.answers, body.timeSpent);
    
    // Update user's profile if they passed the assessment
    if (result.passed) {
      const verificationDate = new Date();
      
      // Find and update the user's profile
      const talentProfile = await TalentProfile.findOne({
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      if (talentProfile) {
        // Check if the skill already exists in the user's profile
        const skillIndex = talentProfile.skills.findIndex(
          s => s.name.toLowerCase() === assessment.skillName.toLowerCase()
        );
        
        if (skillIndex !== -1) {
          // Update existing skill
          talentProfile.skills[skillIndex].verified = true;
          talentProfile.skills[skillIndex].verificationDate = verificationDate;
          talentProfile.skills[skillIndex].verificationMethod = 'assessment';
          
          // If the user's proficiency was lower than the assessment level, update it
          const assessmentLevel = assessment.questions && assessment.questions.length > 0 
            ? assessment.questions[0].difficulty 
            : 'intermediate';
            
          const proficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
          const currentLevelIndex = proficiencyLevels.indexOf(talentProfile.skills[skillIndex].proficiency);
          const assessmentLevelIndex = proficiencyLevels.indexOf(assessmentLevel);
          
          if (assessmentLevelIndex > currentLevelIndex) {
            talentProfile.skills[skillIndex].proficiency = assessmentLevel;
          }
        } else {
          // Add new skill
          const assessmentLevel = assessment.questions && assessment.questions.length > 0 
            ? assessment.questions[0].difficulty 
            : 'intermediate';
            
          talentProfile.skills.push({
            name: assessment.skillName,
            proficiency: assessmentLevel,
            verified: true,
            verificationDate: verificationDate,
            verificationMethod: 'assessment'
          });
        }
        
        // Recalculate profile completion percentage
        talentProfile.calculateCompletionPercentage();
        
        // Save the updated profile
        await talentProfile.save();
      }
      
      // Update skill analytics
      try {
        await SkillAnalytics.findOneAndUpdate(
          { skillName: assessment.skillName },
          { 
            $inc: { 
              'metrics.verifiedUsers': 1,
              'metrics.completedAssessments': 1
            },
            $set: { 'lastUpdated': new Date() }
          },
          { upsert: true }
        );
      } catch (analyticsError) {
        console.error('Error updating skill analytics:', analyticsError);
        // Continue even if analytics update fails
      }
    } else {
      // Update analytics for failed assessment
      try {
        await SkillAnalytics.findOneAndUpdate(
          { skillName: assessment.skillName },
          { 
            $inc: { 'metrics.completedAssessments': 1 },
            $set: { 'lastUpdated': new Date() }
          },
          { upsert: true }
        );
      } catch (analyticsError) {
        console.error('Error updating skill analytics:', analyticsError);
        // Continue even if analytics update fails
      }
    }
    
    // Return the result
    return NextResponse.json({
      success: true,
      result: {
        score: result.score,
        passed: result.passed,
        feedback: result.feedback
      }
    });
    
  } catch (error) {
    console.error('Error submitting skill assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit skill assessment' },
      { status: 500 }
    );
  }
}

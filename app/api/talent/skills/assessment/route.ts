import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import TechnicalSkill from '@/app/models/technicalSkill';
import SkillAssessment from '@/app/models/skillAssessment';
import SkillAnalytics from '@/app/models/skillAnalytics';
import TalentProfile from '@/app/models/talentProfile';
import mongoose from 'mongoose';

// Helper function to fetch AI-generated questions
async function fetchAIGeneratedQuestions(skillName: string, level: string, count: number = 10) {
  try {
    // Call the Python FastAPI service for AI-generated questions
    const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skill: skillName,
        level: level,
        count: count
      }),
      // Set a timeout to prevent hanging if the service is down
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch AI-generated questions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error fetching AI-generated questions:', error);
    // Return null to indicate we should fall back to default questions
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const skillId = searchParams.get('skillId') || '';
    const skillName = searchParams.get('skill') || '';
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // If requesting by skill name
    if (skillName) {
      // Find the skill
      const skill = await TechnicalSkill.findOne({ 
        name: { $regex: new RegExp(`^${skillName}$`, 'i') } 
      });
      
      if (!skill) {
        return NextResponse.json(
          { error: 'Skill not found' },
          { status: 404 }
        );
      }
      
      // Check if user already has a pending or in-progress assessment for this skill
      const existingAssessment = await SkillAssessment.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        skillName: { $regex: new RegExp(`^${skillName}$`, 'i') },
        status: { $in: ['pending', 'in_progress'] }
      });
      
      if (existingAssessment) {
        return NextResponse.json({
          assessment: existingAssessment
        });
      }
      
      // Get user's proficiency level for this skill
      const talentProfile = await TalentProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      let proficiencyLevel = 'intermediate';
      
      if (talentProfile && talentProfile.skills) {
        const userSkill = talentProfile.skills.find(s => 
          s.name.toLowerCase() === skillName.toLowerCase()
        );
        
        if (userSkill && userSkill.proficiency) {
          proficiencyLevel = userSkill.proficiency;
        }
      }
      
      // Generate a new assessment based on the user's proficiency level
      const assessment = await SkillAssessment.generateAssessment(
        skill._id,
        skill.name,
        new mongoose.Types.ObjectId(userId),
        proficiencyLevel as any,
        'quiz'
      );
      
      // Try to enhance the assessment with AI-generated questions if available
      try {
        const aiQuestions = await fetchAIGeneratedQuestions(
          skill.name, 
          proficiencyLevel, 
          10
        );
        
        if (aiQuestions && Array.isArray(aiQuestions) && aiQuestions.length > 0) {
          // Format AI questions to match our schema
          const formattedQuestions = aiQuestions.map((q, index) => ({
            id: `q-${index}`,
            text: q.question,
            options: q.options.map((opt, optIndex) => ({
              id: `q-${index}-opt-${optIndex}`,
              text: opt
            })),
            correctOptionId: `q-${index}-opt-${q.correctOptionIndex}`,
            type: 'multiple_choice',
            difficulty: proficiencyLevel,
            points: q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1
          }));
          
          // Update the assessment with AI-generated questions
          assessment.questions = formattedQuestions;
          await assessment.save();
        }
      } catch (aiError) {
        console.error('Error enhancing assessment with AI questions:', aiError);
        // Continue with default questions if AI service fails
      }
      
      // Update analytics for assessment creation
      try {
        await SkillAnalytics.findOneAndUpdate(
          { skillName: skill.name },
          { 
            $inc: { 'metrics.assessmentsTaken': 1 },
            $set: { 'lastUpdated': new Date() }
          },
          { upsert: true }
        );
      } catch (analyticsError) {
        console.error('Error updating skill analytics:', analyticsError);
        // Continue even if analytics update fails
      }
      
      return NextResponse.json({
        assessment
      });
    }
    
    // Build the query for normal assessment listing
    let query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (status) {
      query.status = status;
    }
    
    if (skillId) {
      query.skillId = new mongoose.Types.ObjectId(skillId);
    }
    
    // Fetch assessments
    const assessments = await SkillAssessment.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      assessments,
      count: assessments.length
    });
    
  } catch (error) {
    console.error('Error fetching skill assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill assessments' },
      { status: 500 }
    );
  }
}

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
    if (!body.skillName) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      );
    }
    
    const assessmentType = body.assessmentType || 'quiz';
    const skillLevel = body.skillLevel || 'intermediate';
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Find the skill
    const skill = await TechnicalSkill.findOne({ 
      name: { $regex: new RegExp(`^${body.skillName}$`, 'i') } 
    });
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }
    
    // Check if user already has a pending or in-progress assessment for this skill
    const existingAssessment = await SkillAssessment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      skillId: skill._id,
      status: { $in: ['pending', 'in_progress'] }
    });
    
    if (existingAssessment) {
      return NextResponse.json({
        message: 'You already have an assessment for this skill',
        assessment: existingAssessment
      });
    }
    
    // Generate a new assessment
    const assessment = await SkillAssessment.generateAssessment(
      skill._id,
      skill.name,
      new mongoose.Types.ObjectId(userId),
      skillLevel as any,
      assessmentType as any
    );
    
    // Try to enhance the assessment with AI-generated questions if available
    try {
      const aiQuestions = await fetchAIGeneratedQuestions(
        skill.name, 
        skillLevel, 
        10
      );
      
      if (aiQuestions && Array.isArray(aiQuestions) && aiQuestions.length > 0) {
        // Format AI questions to match our schema
        const formattedQuestions = aiQuestions.map((q, index) => ({
          id: `q-${index}`,
          text: q.question,
          options: q.options.map((opt, optIndex) => ({
            id: `q-${index}-opt-${optIndex}`,
            text: opt
          })),
          correctOptionId: `q-${index}-opt-${q.correctOptionIndex}`,
          type: 'multiple_choice',
          difficulty: skillLevel,
          points: q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1
        }));
        
        // Update the assessment with AI-generated questions
        assessment.questions = formattedQuestions;
        await assessment.save();
      }
    } catch (aiError) {
      console.error('Error enhancing assessment with AI questions:', aiError);
      // Continue with default questions if AI service fails
    }
    
    // Update analytics
    try {
      let analytics = await SkillAnalytics.findOne({ skillId: skill._id });
      
      if (!analytics) {
        // Create new analytics record if it doesn't exist
        analytics = new SkillAnalytics({
          skillId: skill._id,
          skillName: skill.name,
          category: skill.category
        });
      }
      
      // Increment assessments taken
      analytics.metrics.assessmentsTaken += 1;
      await analytics.save();
    } catch (analyticsError) {
      console.error('Error updating skill analytics:', analyticsError);
      // Continue with the assessment creation even if analytics update fails
    }
    
    return NextResponse.json({
      message: 'Assessment created successfully',
      assessment
    });
    
  } catch (error) {
    console.error('Error creating skill assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create skill assessment' },
      { status: 500 }
    );
  }
}

// For submitting assessment answers
export async function PUT(request: NextRequest) {
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
    
    if (!body.answers) {
      return NextResponse.json(
        { error: 'Answers are required' },
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
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    
    if (assessment.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Assessment is in ${assessment.status} status and cannot be submitted` },
        { status: 400 }
      );
    }
    
    // Calculate time spent
    const timeSpent = body.timeSpent || 0;
    
    // Process the answers and calculate score
    const result = await assessment.completeAssessment(body.answers, timeSpent);
    
    // If assessment is passed, update the user's profile to mark the skill as verified
    if (result.passed) {
      await TalentProfile.findOneAndUpdate(
        { 
          userId: new mongoose.Types.ObjectId(userId),
          'skills.name': assessment.skillName
        },
        { 
          $set: { 
            'skills.$.verified': true,
            'skills.$.assessmentId': assessment._id 
          } 
        }
      );
      
      // Update analytics
      try {
        let analytics = await SkillAnalytics.findOne({ skillId: assessment.skillId });
        
        if (analytics) {
          analytics.metrics.verifiedUsers += 1;
          await analytics.save();
        }
      } catch (analyticsError) {
        console.error('Error updating skill analytics:', analyticsError);
        // Continue even if analytics update fails
      }
    }
    
    return NextResponse.json({
      message: 'Assessment completed successfully',
      score: result.score,
      passed: result.passed,
      feedback: result.feedback
    });
    
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}

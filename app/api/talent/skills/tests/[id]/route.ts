import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { 
  findSkillTestById, 
  createTestAttempt, 
  createVerifiedSkill,
  findUserTestAttemptByTestId
} from '@/app/models/skillTest';
import { ObjectId } from 'mongodb';

// GET endpoint to retrieve a specific skill test
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testId = params.id;
    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get the test
    const test = await findSkillTestById(db, testId);
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    // Check if user has already taken this test
    const previousAttempt = await findUserTestAttemptByTestId(db, userData.id, testId);
    
    // For security, don't send correct answers if the test is being taken
    const secureTest = {
      ...test.toObject(),
      questions: test.questions.map(q => ({
        _id: q._id,
        text: q.text,
        options: q.options,
        difficulty: q.difficulty
        // Omitting correctAnswer and explanation
      }))
    };
    
    return NextResponse.json({
      test: secureTest,
      hasPreviousAttempt: !!previousAttempt,
      previousScore: previousAttempt?.score
    });
  } catch (error) {
    console.error('Error retrieving skill test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to submit test results
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testId = params.id;
    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

    // Parse request body
    const { answers, startTime, endTime } = await request.json();
    
    if (!answers || !Array.isArray(answers) || !startTime || !endTime) {
      return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get the test with correct answers
    const test = await findSkillTestById(db, testId);
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    // Calculate score
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    const completionTimeSeconds = Math.round((endTimeDate.getTime() - startTimeDate.getTime()) / 1000);
    
    // Validate and score each answer
    const scoredAnswers = answers.map(answer => {
      const question = test.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) {
        return {
          ...answer,
          isCorrect: false
        };
      }
      
      const isCorrect = answer.selectedOption === question.correctAnswer;
      return {
        ...answer,
        isCorrect
      };
    });
    
    // Calculate overall score
    const correctAnswers = scoredAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = test.questions.length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = scorePercentage >= test.passingScore;
    
    // Create test attempt record
    const testAttempt = await createTestAttempt(db, {
      userId: new ObjectId(userData.id),
      testId: new ObjectId(testId),
      score: scorePercentage,
      passed,
      answers: scoredAnswers,
      startTime: startTimeDate,
      endTime: endTimeDate,
      completionTime: completionTimeSeconds,
      createdAt: new Date()
    });
    
    // If the user passed the test, create a verified skill
    if (passed) {
      await createVerifiedSkill(db, {
        userId: new ObjectId(userData.id),
        skill: test.skillCategory,
        testId: new ObjectId(testId),
        score: scorePercentage,
        verifiedAt: new Date(),
        // Skills are verified for 6 months
        expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
      });
      
      // Update user profile to add verified skill badge
      await db.collection('users').updateOne(
        { _id: new ObjectId(userData.id) },
        { 
          $addToSet: { 
            verifiedSkills: test.skillCategory 
          } 
        }
      );
    }
    
    // Return results with explanations for each question
    const resultsWithExplanations = scoredAnswers.map(answer => {
      const question = test.questions.find(q => q._id.toString() === answer.questionId);
      return {
        ...answer,
        explanation: question?.explanation || '',
        correctAnswer: question?.correctAnswer
      };
    });
    
    return NextResponse.json({
      score: scorePercentage,
      passed,
      correctAnswers,
      totalQuestions,
      completionTime: completionTimeSeconds,
      results: resultsWithExplanations
    });
  } catch (error) {
    console.error('Error submitting test results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

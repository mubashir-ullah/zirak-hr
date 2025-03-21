import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { 
  findSkillTests, 
  recommendSkillTests, 
  findUserCompletedTests 
} from '@/app/models/skillTest';
import { findResumeByUserIdForJobApplication } from '@/app/models/resume';

// GET endpoint to retrieve available skill tests and recommendations
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get user's skills from their resume
    const resume = await findResumeByUserIdForJobApplication(db, userData.id);
    const userSkills = resume?.skills || [];
    
    // Get completed tests
    const completedTests = await findUserCompletedTests(db, userData.id);
    
    // Get recommended tests based on user skills
    const recommendedTests = await recommendSkillTests(db, userData.id, userSkills, 5);
    
    // Get available tests (excluding completed ones)
    const completedTestIds = completedTests.map(test => test.testId._id.toString());
    const availableTests = await findSkillTests(
      db, 
      { _id: { $nin: completedTestIds } },
      10
    );
    
    return NextResponse.json({
      completedTests,
      recommendedTests,
      availableTests
    });
  } catch (error) {
    console.error('Error retrieving skill tests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

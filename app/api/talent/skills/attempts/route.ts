import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { findUserTestAttempts } from '@/app/models/skillTest';
import { ObjectId } from 'mongodb';

// GET endpoint to retrieve a user's test attempts
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get test attempts
    const attempts = await findUserTestAttempts(db, userData.id);
    
    return NextResponse.json({
      attempts
    });
  } catch (error) {
    console.error('Error retrieving test attempts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

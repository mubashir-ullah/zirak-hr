import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get the current session to verify the user is authenticated and is an admin
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }
    
    // Check if the current user is an admin
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json(
        { message: 'Only administrators can promote users' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { userId } = body;
    
    // Validate the userId
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    try {
      // Connect to the database
      const client = await clientPromise;
      if (!client) {
        throw new Error('Failed to connect to database');
      }
      const db = client.db('zirakhr');
      
      // Update the user's role to admin in the database
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            role: 'admin',
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      console.log(`Promoted user ${userId} to admin role`);
      
      return NextResponse.json(
        { message: 'User promoted to admin successfully' },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error in promote-user:', dbError);
      return NextResponse.json(
        { message: 'Database error occurred' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in promote-user API:', error);
    return NextResponse.json(
      { message: 'An error occurred while promoting the user' },
      { status: 500 }
    );
  }
}

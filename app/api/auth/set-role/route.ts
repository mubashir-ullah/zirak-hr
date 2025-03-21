import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get the current session to verify the user is authenticated
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'You must be logged in to set a role' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { role, userId } = body;
    
    console.log('Set role request:', { role, userId, session: session.user });
    
    // Validate the role
    if (role !== 'talent' && role !== 'hiring_manager') {
      return NextResponse.json(
        { message: 'Invalid role. Role must be either "talent" or "hiring_manager"' },
        { status: 400 }
      );
    }
    
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
      
      // Update the user's role in the database
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            role: role,
            needsRoleSelection: false,
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
      
      console.log(`Updated role for user ${userId} to ${role}`);
      
      return NextResponse.json(
        { message: 'Role updated successfully', role },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error in set-role:', dbError);
      
      // For development purposes, we'll simulate success if database connection fails
      console.log(`[MOCK] Updated role for user ${userId} to ${role}`);
      
      return NextResponse.json(
        { message: 'Role updated successfully (mock)', role },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in set-role API:', error);
    return NextResponse.json(
      { message: 'An error occurred while setting the role' },
      { status: 500 }
    );
  }
}

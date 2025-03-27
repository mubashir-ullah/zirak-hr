import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
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
        { message: 'Only administrators can view all users' },
        { status: 403 }
      );
    }
    
    try {
      // Connect to the database
      const client = await clientPromise;
      if (!client) {
        throw new Error('Failed to connect to database');
      }
      const db = client.db('zirakhr');
      
      // Fetch all users from the database
      const users = await db.collection('users').find({}).toArray();
      
      // Transform the data to match the expected format
      const formattedUsers = users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        socialProvider: user.socialProvider
      }));
      
      return NextResponse.json(
        { users: formattedUsers },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error in fetch users:', dbError);
      
      // For development purposes, we'll return mock data if database connection fails
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'talent',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'hiring_manager',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'Admin User',
          email: 'admin@zirak.com',
          role: 'admin',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      return NextResponse.json(
        { users: mockUsers, mock: true },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in fetch users API:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
}

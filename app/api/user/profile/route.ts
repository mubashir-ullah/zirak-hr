import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { User } from '../../../models/user';

// GET endpoint to retrieve user profile
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Get the userId from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Find the user
    let user = await User.findOne({ _id: userId }).select('-password');
    
    // If no user exists, create a default user (for demo purposes)
    if (!user) {
      user = await User.create({
        _id: userId,
        name: 'Ahmed Khan',
        email: 'ahmed.khan@techinnovations.com',
        phone: '+92 300 1234567',
        role: 'hr_manager',
        department: 'Human Resources',
        company: 'Tech Innovations',
        profileImage: '/avatars/ahmed.jpg',
      });
    }
    
    return NextResponse.json(user);
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update user profile
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, profile } = body;
    
    if (!userId || !profile) {
      return NextResponse.json(
        { error: 'User ID and profile data are required' },
        { status: 400 }
      );
    }
    
    // Find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: profile },
      { new: true, upsert: true }
    ).select('-password');
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

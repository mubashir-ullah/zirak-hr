import { NextResponse } from 'next/server';
import { findUserById, updateUser } from '@/lib/database';
import supabase from '@/lib/supabase';

// GET endpoint to retrieve user profile
export async function GET(request: Request) {
  try {
    // Get the userId from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Find the user using our new database function
    const user = await findUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Transform the user data to match the expected format
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
      company: user.company || '',
      profileImage: user.profile_picture || '',
      needs_role_selection: user.needs_role_selection,
      needs_profile_completion: user.needs_profile_completion,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    return NextResponse.json(userProfile);
    
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
    // Get the current session from Supabase to verify authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { userId, profile } = body;
    
    if (!userId || !profile) {
      return NextResponse.json(
        { error: 'User ID and profile data are required' },
        { status: 400 }
      );
    }
    
    // Ensure the user can only update their own profile unless they're an admin
    const currentUser = await findUserById(session.user.id);
    if (userId !== session.user.id && currentUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }
    
    // Transform profile data to match our database schema
    const userData = {
      name: profile.name,
      phone: profile.phone,
      department: profile.department,
      company: profile.company,
      profile_picture: profile.profileImage,
      updated_at: new Date().toISOString()
    };
    
    // Update the user using our new database function
    const updatedUser = await updateUser(userId, userData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }
    
    // Transform the updated user data to match the expected format
    const userProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone || '',
      department: updatedUser.department || '',
      company: updatedUser.company || '',
      profileImage: updatedUser.profile_picture || '',
      needs_role_selection: updatedUser.needs_role_selection,
      needs_profile_completion: updatedUser.needs_profile_completion,
      email_verified: updatedUser.email_verified,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at
    };
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userProfile
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

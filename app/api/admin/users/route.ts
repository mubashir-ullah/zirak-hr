import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { getAllUsers } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }
    
    // Check if the current user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only administrators can view all users' },
        { status: 403 }
      );
    }
    
    try {
      // Fetch all users from the database
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          created_at,
          updated_at,
          social_provider,
          is_verified,
          has_completed_profile
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match the expected format
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        socialProvider: user.social_provider,
        isVerified: user.is_verified,
        hasCompletedProfile: user.has_completed_profile
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

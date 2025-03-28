import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserById, updateUser } from '@/lib/database';

export async function POST(request: NextRequest) {
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
      // First check if the user exists
      const user = await findUserById(userId);
      
      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      // Update the user's role to admin in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user role:', updateError);
        return NextResponse.json(
          { message: 'Failed to update user role' },
          { status: 500 }
        );
      }
      
      // Also update the user's metadata in auth
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: 'admin' } }
      );
      
      if (authUpdateError) {
        console.error('Error updating auth metadata:', authUpdateError);
        // Continue anyway since the database was updated successfully
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

import { NextRequest, NextResponse } from 'next/server';
import { setUserRole } from '@/lib/supabaseAuth';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the current session to verify the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'You must be logged in to set a role' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { role, userId } = body;
    
    console.log('Set role request:', { role, userId, sessionUser: session.user.email });
    
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
    
    // Update the user's role using Supabase
    const { user, error } = await setUserRole(userId, role);
    
    if (error) {
      console.error('Error setting user role:', error);
      return NextResponse.json(
        { message: 'Failed to update user role', error },
        { status: 500 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return success response with updated user
    return NextResponse.json({
      message: 'Role updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        needsRoleSelection: user.needs_role_selection
      }
    });
    
  } catch (error) {
    console.error('Error in set-role API:', error);
    return NextResponse.json(
      { message: 'An error occurred while setting the role', error: String(error) },
      { status: 500 }
    );
  }
}

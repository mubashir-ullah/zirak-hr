import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserByEmail, updateUserRole, createUser } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, userId, email } = body;

    if (!role || (!userId && !email)) {
      return NextResponse.json(
        { message: 'Role and either userId or email are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'talent' && role !== 'hiring_manager' && role !== 'admin') {
      return NextResponse.json(
        { message: 'Invalid role. Must be "talent", "hiring_manager", or "admin"' },
        { status: 400 }
      );
    }

    let userIdToUpdate = userId;

    // If userId is not provided, try to find user by email
    if (!userIdToUpdate && email) {
      const user = await findUserByEmail(email);
      
      if (user) {
        userIdToUpdate = user.id;
      } else {
        // If user doesn't exist in our database yet, we need to find their ID
        // We'll use the Supabase client to look up users by email
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
        
        if (authError || !authUser) {
          console.error('Error finding user by email:', authError);
          return NextResponse.json(
            { message: 'User not found' },
            { status: 404 }
          );
        }
        
        userIdToUpdate = authUser.id;
        
        // Create user in our database using our new database function
        const newUser = await createUser({
          id: userIdToUpdate,
          email: email.toLowerCase(),
          role: role,
          email_verified: true,
          needs_role_selection: false,
          needs_profile_completion: true
        });
        
        if (!newUser) {
          return NextResponse.json(
            { message: 'Failed to create user record' },
            { status: 500 }
          );
        }
      }
    }

    if (!userIdToUpdate) {
      return NextResponse.json(
        { message: 'Could not determine user ID' },
        { status: 400 }
      );
    }

    // Update user role in our database using our new database function
    const updated = await updateUserRole(userIdToUpdate, role);
    
    if (!updated) {
      return NextResponse.json(
        { message: 'Failed to update user role' },
        { status: 500 }
      );
    }

    // Update user metadata in Supabase Auth
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      userIdToUpdate,
      {
        user_metadata: { 
          role,
          needs_role_selection: false
        }
      }
    );

    if (updateAuthError) {
      console.error('Error updating user metadata:', updateAuthError);
      // Continue anyway since we've updated our database
    }

    // Determine the redirect URL based on role
    let redirectTo = '/dashboard';
    if (role === 'talent') {
      redirectTo = '/dashboard/talent';
    } else if (role === 'hiring_manager') {
      redirectTo = '/dashboard/hiring-manager';
    } else if (role === 'admin') {
      redirectTo = '/dashboard/admin';
    }

    return NextResponse.json(
      { 
        message: 'Role updated successfully',
        role: role,
        redirectTo: redirectTo
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting role:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

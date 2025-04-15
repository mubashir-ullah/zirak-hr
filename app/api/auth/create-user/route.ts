import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/app/lib/supabase'; 
import { createUser, findUserByEmail } from '@/lib/supabaseDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, role = 'talent', needs_role_selection = true } = body;
    
    console.log('Create user API called with:', { 
      id, 
      email, 
      name, 
      role,
      needs_role_selection 
    });

    if (!id || !email || !name) {
      return NextResponse.json(
        { message: 'User ID, email, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists in our database
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      // User already exists, return success
      console.log('User already exists in database, returning:', existingUser);
      
      // But first check if we need to update Supabase metadata to match our DB
      try {
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(id);
        
        if (authUser && (
            existingUser.role !== authUser.user_metadata?.role || 
            existingUser.needs_role_selection !== authUser.user_metadata?.needs_role_selection
        )) {
          console.log('Updating Supabase metadata to match our database');
          await supabaseAdmin.auth.admin.updateUserById(
            id,
            {
              user_metadata: { 
                role: existingUser.role,
                name: existingUser.name,
                needs_role_selection: existingUser.needs_role_selection || false
              }
            }
          );
          console.log('Supabase metadata updated successfully');
        }
      } catch (authError) {
        console.error('Error checking/updating Supabase user:', authError);
        // Continue anyway since we have the user in our database
      }
      
      return NextResponse.json(
        { message: 'User already exists', user: existingUser },
        { status: 200 }
      );
    }

    // Create user in our database
    const userData = {
      id,
      name,
      email: email.toLowerCase(),
      role: role || 'talent', 
      email_verified: true, // Auto-verify for now
      needs_role_selection: needs_role_selection === true,
      needs_profile_completion: true,
      social_provider: undefined
    };

    console.log('Creating new user with data:', userData);
    const { user, error } = await createUser(userData);

    if (error) {
      console.error('Database error creating user:', error);
      return NextResponse.json(
        { message: 'Failed to create user record', error: String(error) },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Failed to create user record: unknown error' },
        { status: 500 }
      );
    }

    // Also update user metadata in Supabase Auth to match
    try {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          user_metadata: { 
            role: role || 'talent',
            name: name,
            needs_role_selection: needs_role_selection === true,
            needs_profile_completion: true
          }
        }
      );

      if (updateError) {
        console.error('Error updating user metadata in Supabase Auth:', updateError);
        // Continue anyway since we've created the user in our database
      } else {
        console.log('User metadata updated in Supabase Auth');
      }
    } catch (authError) {
      console.error('Exception updating user metadata:', authError);
      // Continue anyway
    }

    console.log('User created successfully:', user);
    
    // Determine the appropriate redirect URL
    let redirectUrl;
    if (user.needs_role_selection || !user.role) {
      redirectUrl = '/dashboard/role-selection';
    } else if (user.role === 'talent') {
      redirectUrl = '/dashboard/talent';
    } else if (user.role === 'hiring_manager') {
      redirectUrl = '/dashboard/hiring-manager';
    } else if (user.role === 'admin') {
      redirectUrl = '/dashboard/admin';
    } else {
      redirectUrl = '/dashboard';
    }
    
    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user,
        redirectUrl
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred', error: String(error) },
      { status: 500 }
    );
  }
}

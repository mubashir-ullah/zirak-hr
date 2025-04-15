import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/app/lib/supabase'; // Import the admin client
import { findUserByEmail, updateUser, createUser } from '@/lib/supabaseDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, userId, email } = body;

    console.log('Set Role API called with:', { role, userId, email: email?.substring(0, 5) + '...' });

    if (!role || (!userId && !email)) {
      return NextResponse.json(
        { message: 'Role and either userId or email are required' },
        { status: 400 }
      );
    }

    // Normalize role format to ensure consistency (use underscore format for internal storage)
    let normalizedRole = role.replace('-', '_').toLowerCase();
    
    // Validate role
    if (normalizedRole !== 'talent' && normalizedRole !== 'hiring_manager' && normalizedRole !== 'admin') {
      return NextResponse.json(
        { message: 'Invalid role. Must be "talent", "hiring_manager", or "admin"' },
        { status: 400 }
      );
    }

    let userIdToUpdate = userId;

    // If userId is not provided, try to find user by email
    if (!userIdToUpdate && email) {
      console.log('Finding user by email');
      const user = await findUserByEmail(email);
      
      if (user) {
        console.log('User found in database');
        userIdToUpdate = user.id;
      } else {
        console.log('User not found in database, looking up in Supabase Auth');
        // If user doesn't exist in our database yet, we need to find their ID
        // We'll use the Supabase client to look up users by email
        try {
          // Use admin listUsers to find user by email
          const { data, error } = await supabaseAdmin.auth.admin.listUsers();
          
          if (error) {
            console.error('Error listing users:', error);
            return NextResponse.json(
              { message: 'Error accessing Supabase Auth' },
              { status: 500 }
            );
          }
          
          // Find the user with matching email
          const authUser = data.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
          
          if (!authUser) {
            console.error('User not found in Supabase Auth');
            return NextResponse.json(
              { message: 'User not found in Supabase Auth' },
              { status: 404 }
            );
          }
          
          userIdToUpdate = authUser.id;
          console.log('Found user in Supabase Auth, ID:', userIdToUpdate);
          
          // Create user in our database
          console.log('Creating user in database');
          const { user: newUser, error: createError } = await createUser({
            id: userIdToUpdate,
            email: email.toLowerCase(),
            name: authUser.user_metadata?.full_name || email.split('@')[0],
            role: normalizedRole,
            email_verified: true,
            needs_role_selection: false,
            social_provider: authUser.app_metadata?.provider || undefined
          });
          
          if (createError || !newUser) {
            console.error('Error creating user record:', createError);
            return NextResponse.json(
              { message: 'Failed to create user record' },
              { status: 500 }
            );
          }
          
          console.log('User created in database');
          
          // Immediately update user metadata in Supabase Auth for consistency
          try {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              userIdToUpdate,
              {
                user_metadata: { 
                  role: normalizedRole,
                  needs_role_selection: false
                }
              }
            );
            
            if (updateError) {
              console.error('Error updating user metadata after creation:', updateError);
              // Continue anyway since we've created the database record
            } else {
              console.log('User metadata updated right after user creation');
            }
          } catch (metadataError) {
            console.error('Exception updating user metadata after creation:', metadataError);
            // Continue anyway since we've created the database record
          }
          
          // Determine the appropriate redirect URL based on role
          let redirectTo = '/dashboard';
          if (normalizedRole === 'talent') {
            redirectTo = '/dashboard/talent';
          } else if (normalizedRole === 'hiring_manager') {
            redirectTo = '/dashboard/hiring-manager';
          } else if (normalizedRole === 'admin') {
            redirectTo = '/dashboard/admin';
          }
          
          console.log('Role set successfully, redirect URL:', redirectTo);
          
          return NextResponse.json(
            { 
              message: 'User created and role set successfully',
              role: normalizedRole,
              redirectTo: redirectTo
            },
            { status: 200 }
          );
        } catch (authError) {
          console.error('Error accessing Supabase Auth:', authError);
          return NextResponse.json(
            { message: 'Error accessing authentication service' },
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

    // Update user role in our database
    console.log('Updating user role in database to:', normalizedRole);
    const updated = await updateUser(userIdToUpdate, {
      role: normalizedRole,
      needs_role_selection: false,
      updated_at: new Date().toISOString()
    });
    
    if (!updated) {
      return NextResponse.json(
        { message: 'Failed to update user role in database' },
        { status: 500 }
      );
    }

    console.log('Role updated in database successfully');

    // Update user metadata in Supabase Auth
    console.log('Updating user metadata in Supabase Auth');
    try {
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        userIdToUpdate,
        {
          user_metadata: { 
            role: normalizedRole,
            needs_role_selection: false
          }
        }
      );

      if (updateAuthError) {
        console.error('Error updating user metadata in Supabase Auth:', updateAuthError);
        // Continue anyway since we've updated our database
      } else {
        console.log('User metadata updated in Supabase Auth');
      }
    } catch (metadataError) {
      console.error('Exception updating user metadata:', metadataError);
      // Continue anyway since we've updated our database
    }

    // Determine the redirect URL based on role
    let redirectTo = '/dashboard';
    if (normalizedRole === 'talent') {
      redirectTo = '/dashboard/talent';
    } else if (normalizedRole === 'hiring_manager') {
      redirectTo = '/dashboard/hiring-manager';
    } else if (normalizedRole === 'admin') {
      redirectTo = '/dashboard/admin';
    }

    console.log('Role updated successfully, redirect URL:', redirectTo);

    return NextResponse.json(
      { 
        message: 'Role updated successfully',
        role: normalizedRole,
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

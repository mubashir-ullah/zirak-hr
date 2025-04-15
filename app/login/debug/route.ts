import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/app/lib/supabase'; // Admin client
import supabase from '@/lib/supabase'; // Regular client
import { findUserByEmail } from '@/lib/supabaseDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Login debug: Attempting to sign in with email:', email);

    // First, check if the user exists in Supabase Auth
    try {
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        return NextResponse.json(
          { message: 'Error accessing Supabase Auth', error: listError.message },
          { status: 500 }
        );
      }
      
      // Find the user with the matching email
      const authUser = users.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
      
      if (!authUser) {
        console.error('User not found in Supabase Auth');
        return NextResponse.json(
          { message: 'User not found in Supabase Auth' },
          { status: 404 }
        );
      }
      
      console.log('User found in Supabase Auth:', { 
        id: authUser.id,
        email: authUser.email,
        emailConfirmed: authUser.email_confirmed_at ? true : false,
        userMetadata: authUser.user_metadata,
        appMetadata: authUser.app_metadata
      });
    } catch (authError) {
      console.error('Error checking user in Supabase Auth:', authError);
    }

    // Try to sign in with the regular client
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Login error:', signInError);
      return NextResponse.json(
        { message: 'Login failed', error: signInError.message },
        { status: 401 }
      );
    }

    if (!signInData.user) {
      return NextResponse.json(
        { message: 'No user returned from sign in' },
        { status: 400 }
      );
    }

    console.log('User signed in successfully:', {
      id: signInData.user.id,
      email: signInData.user.email,
      emailConfirmed: signInData.user.email_confirmed_at ? true : false,
      userMetadata: signInData.user.user_metadata,
      appMetadata: signInData.user.app_metadata
    });

    // Check if user exists in our database
    const dbUser = await findUserByEmail(email);
    
    if (!dbUser) {
      console.log('User not found in database');
      return NextResponse.json(
        { 
          message: 'User signed in successfully but not found in database',
          user: signInData.user,
          needsUserCreation: true
        },
        { status: 200 }
      );
    }

    console.log('User found in database:', {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      needsRoleSelection: dbUser.needs_role_selection
    });

    return NextResponse.json(
      { 
        message: 'Login successful',
        user: dbUser,
        authUser: signInData.user
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in login debug:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
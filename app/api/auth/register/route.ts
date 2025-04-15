import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { createUser, findUserByEmail } from '@/lib/supabaseDb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Registration attempt for email:', email);

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log('User already exists in database:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Register user with Supabase Auth
    console.log('Registering user with Supabase Auth...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'talent', // Default role is talent
          needs_role_selection: !role // Only needs role selection if no role provided
        }
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      console.error('No user returned from Supabase');
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    console.log('User created in Supabase Auth:', data.user.id);

    // Create user in our database
    console.log('Creating user in database...');
    const userData = {
      id: data.user.id,
      email: email.toLowerCase(),
      name,
      role: role || 'talent',
      needs_role_selection: !role, // Only needs role selection if no role provided
      needs_profile_completion: true,
      email_verified: true, // We'll assume the email is verified for now
    };

    const { user: newUser, error: dbError } = await createUser(userData);

    if (dbError || !newUser) {
      console.error('Failed to create user in database:', dbError);
      // Continue with registration but log the error
    } else {
      console.log('User created in database successfully:', newUser.id);
    }

    // Return successful response
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: data.user.id,
        name,
        email,
        role: role || 'talent',
        needsRoleSelection: !role
      }
    });
  } catch (error) {
    console.error('Unexpected registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}

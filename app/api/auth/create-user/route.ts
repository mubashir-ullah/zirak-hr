import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { createUser, findUserByEmail } from '@/lib/supabaseDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, role, social_provider } = body;

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
      role: role || '', // Use provided role or empty string
      email_verified: false, // Will be set to true after OTP verification
      needs_role_selection: !role, // Only needs role selection if no role provided
      needs_profile_completion: true,
      social_provider: social_provider || null // Store the social provider if available
    };

    const { user, error } = await createUser(userData);

    if (error) {
      console.error('Database error creating user:', error);
      return NextResponse.json(
        { message: 'Failed to create user record', error: error.message || 'Database error' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Failed to create user record' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'User created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

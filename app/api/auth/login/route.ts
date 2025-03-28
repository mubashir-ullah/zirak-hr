import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserByEmail } from '@/lib/database';
import { isEmailVerified } from '@/lib/otp';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user from our database
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Check if email is verified
    const emailVerified = await isEmailVerified(email);
    const needsEmailVerification = !emailVerified && !user.email_verified;

    // Create a response object with user data
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        needsRoleSelection: user.needs_role_selection,
        needsProfileCompletion: user.needs_profile_completion,
        needsEmailVerification: needsEmailVerification
      },
      session: {
        expires_at: data.session?.expires_at
      }
    });

    // Set the session cookie - Supabase handles this automatically
    // but we can also set our own cookies if needed
    if (rememberMe) {
      // Set a longer expiration for the session if rememberMe is true
      await supabase.auth.updateSession({
        refresh_token: data.session?.refresh_token || '',
        expires_in: 30 * 24 * 60 * 60 // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/supabaseDb';

export async function GET(request: NextRequest) {
  try {
    // Get email from query params
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json(
      { 
        message: 'User found',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          email_verified: user.email_verified,
          needs_role_selection: user.needs_role_selection,
          needs_profile_completion: user.needs_profile_completion
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/supabaseDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user in our database
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { 
          message: 'User not found',
          isVerified: false
        },
        { status: 404 }
      );
    }

    // Return the email verification status from our database
    return NextResponse.json(
      {
        message: 'Email verification status retrieved',
        isVerified: user.email_verified === true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role || '',
          needs_role_selection: !user.role || user.needs_role_selection
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking email verification status:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred', isVerified: false },
      { status: 500 }
    );
  }
}

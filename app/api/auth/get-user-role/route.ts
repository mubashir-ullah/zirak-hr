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
          needsRegistration: true
        },
        { status: 404 }
      );
    }

    // Check if user needs to select a role
    if (!user.role || user.needs_role_selection) {
      return NextResponse.json(
        {
          message: 'User needs to select a role',
          needsRoleSelection: true,
          email: user.email
        },
        { status: 200 }
      );
    }

    // Check if email is verified
    if (user.role && !user.email_verified) {
      return NextResponse.json(
        {
          message: 'Email verification required',
          needsEmailVerification: true,
          email: user.email
        },
        { status: 200 }
      );
    }

    // Determine the redirect URL based on the user's role
    let redirectUrl = '/dashboard';
    
    if (user.role === 'talent') {
      redirectUrl = '/dashboard/talent';
    } else if (user.role === 'hiring_manager') {
      redirectUrl = '/dashboard/hiring-manager';
    } else if (user.role === 'admin') {
      redirectUrl = '/dashboard/admin';
    }

    return NextResponse.json(
      {
        message: 'User role retrieved successfully',
        role: user.role,
        redirectUrl,
        needsProfileCompletion: user.needs_profile_completion || false
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

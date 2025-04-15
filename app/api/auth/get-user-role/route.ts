import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserByEmail, findUserById, createUser } from '@/lib/supabaseDb';
import { isEmailVerified } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId } = body;

    if (!email && !userId) {
      return NextResponse.json(
        { message: 'Email or userId is required' },
        { status: 400 }
      );
    }

    console.log('Get User Role API called with:', { 
      email: email?.substring(0, 5) + '...',
      userId 
    });

    // First, try to find the user by ID if provided
    let user = null;
    if (userId) {
      console.log('Finding user by ID:', userId);
      user = await findUserById(userId);
    }
    
    // If not found by ID or ID not provided, try by email
    if (!user && email) {
      console.log('Finding user by email');
      user = await findUserByEmail(email);
    }

    if (!user) {
      console.log('User not found in database');
      
      // Check if the user exists in Supabase Auth but not in our database
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(userId);
      
      if (authUser) {
        console.log('User exists in Supabase auth but not in our database, creating profile');
        
        // Create user record
        const { user: newUser, error: createError } = await createUser({
          id: authUser.id,
          name: authUser.user_metadata?.name || email?.split('@')[0] || 'User',
          email: authUser.email || email || '',
          role: authUser.user_metadata?.role || 'talent',
          needs_role_selection: !authUser.user_metadata?.role || true,
          email_verified: true
        });
        
        if (createError || !newUser) {
          console.error('Failed to create user record:', createError);
          return NextResponse.json(
            { message: 'Failed to create user profile' },
            { status: 500 }
          );
        }
        
        console.log('User profile created:', newUser);
        
        // Return newly created user data
        return NextResponse.json({
          message: 'User profile created',
          role: newUser.role,
          needsRoleSelection: newUser.needs_role_selection,
          redirectUrl: '/dashboard/role-selection'
        });
      }
      
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found:', {
      id: user.id,
      role: user.role,
      needs_role_selection: user.needs_role_selection,
      email_verified: user.email_verified
    });

    // Check if email is verified
    const needsEmailVerification = !user.email_verified && !(await isEmailVerified(email));
    
    if (needsEmailVerification) {
      console.log('User needs email verification');
      return NextResponse.json({
        message: 'Email verification required',
        needsEmailVerification: true,
        redirectUrl: `/verify-email?email=${encodeURIComponent(email || user.email)}`
      });
    }

    // Check if user needs to select a role
    if (user.needs_role_selection || !user.role) {
      console.log('User needs role selection');
      return NextResponse.json({
        message: 'Role selection required',
        needsRoleSelection: true,
        redirectUrl: '/dashboard/role-selection'
      });
    }

    // Determine the redirect URL based on role
    let redirectUrl = '/dashboard';
    if (user.role === 'talent') {
      redirectUrl = '/dashboard/talent';
    } else if (user.role === 'hiring_manager') {
      redirectUrl = '/dashboard/hiring-manager';
    } else if (user.role === 'admin') {
      redirectUrl = '/dashboard/admin';
    }

    console.log('Sending user role info:', {
      role: user.role,
      redirectUrl
    });

    return NextResponse.json({
      message: 'User role retrieved successfully',
      role: user.role,
      needsProfileCompletion: user.needs_profile_completion,
      redirectUrl
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { findUserByEmail } from '@/lib/supabaseDb';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log('Fix email verification API called for:', email);

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user in our database
    const user = await findUserByEmail(email);

    if (!user) {
      console.error('User not found in database:', email);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found in database:', { id: user.id, email: user.email, role: user.role });

    // Check if the email is already verified in our database
    if (!user.email_verified) {
      console.log('Email not verified in our database, updating...');
      // Update our database first
      const { error: updateError } = await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('email', email.toLowerCase());

      if (updateError) {
        console.error('Error updating user verification status:', updateError);
        return NextResponse.json(
          { message: 'Failed to update verification status in database' },
          { status: 500 }
        );
      }
      console.log('Email verification status updated in our database');
    } else {
      console.log('Email already verified in our database');
    }

    // Create a Supabase client with route handler
    const supabaseAuth = createRouteHandlerClient({ cookies });
    
    try {
      // Get the current user
      const { data: { user: authUser }, error: getUserError } = await supabaseAuth.auth.getUser();
      
      if (getUserError || !authUser) {
        console.error('Error getting user from Supabase auth:', getUserError);
        
        // Try to sign in with email/password to get a session
        const { error: signInError } = await supabaseAuth.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false,
          }
        });
        
        if (signInError) {
          console.error('Error signing in with OTP:', signInError);
          return NextResponse.json(
            { message: 'Failed to authenticate user' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { 
            message: 'Authentication initiated, please check your email for verification link',
            status: 'otp_sent'
          },
          { status: 200 }
        );
      }
      
      console.log('User found in Supabase auth:', authUser.id);
      
      // Update the user's email verification status in Supabase Auth
      // FIXED: The correct parameter is 'email_confirm' (not 'email_confirmed')
      const { error: adminUpdateError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { email_confirm: true }
      );
      
      if (adminUpdateError) {
        console.error('Error updating Supabase auth email verification:', adminUpdateError);
        return NextResponse.json(
          { message: 'Failed to update email verification status in Supabase' },
          { status: 500 }
        );
      }
      
      console.log('Email verification status updated in Supabase auth');
      
      return NextResponse.json(
        { 
          message: 'Email verification status fixed successfully',
          user: {
            id: user.id,
            email: user.email,
            role: user.role || '',
            email_verified: true
          }
        },
        { status: 200 }
      );
    } catch (authError) {
      console.error('Error in Supabase auth operations:', authError);
      return NextResponse.json(
        { message: 'An unexpected error occurred during authentication' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fixing email verification:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

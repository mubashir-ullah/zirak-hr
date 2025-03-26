import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { findUserByEmail } from '@/lib/supabaseDb';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log('Refresh session API called for email:', email);

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the user from our database
    const user = await findUserByEmail(email);

    if (!user) {
      console.error('User not found in database:', email);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found in database:', { id: user.id, email: user.email, role: user.role });

    // Create a Supabase server client
    const supabaseClient = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return NextResponse.json(
        { message: 'Failed to get session' },
        { status: 500 }
      );
    }
    
    if (!session) {
      console.log('No session found, attempting to refresh');
      // If there's no session, try to refresh the session
      const { data: { session: newSession }, error } = await supabaseClient.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        
        // Try to sign in with email (passwordless)
        try {
          console.log('Attempting to sign in with OTP');
          const { error: signInError } = await supabaseClient.auth.signInWithOtp({
            email: email,
            options: {
              shouldCreateUser: false,
            }
          });
          
          if (signInError) {
            console.error('Error signing in with OTP:', signInError);
            return NextResponse.json(
              { message: 'Failed to refresh session and sign in' },
              { status: 500 }
            );
          }
          
          console.log('OTP sign-in initiated, verification email sent');
          
          // Return success even though we just sent an OTP
          // The frontend will handle the redirect properly
          return NextResponse.json(
            { 
              message: 'Authentication initiated',
              user: {
                id: user.id,
                email: user.email,
                role: user.role
              },
              authStatus: 'otp_sent'
            },
            { status: 200 }
          );
        } catch (otpError) {
          console.error('Error in OTP process:', otpError);
          return NextResponse.json(
            { message: 'Failed to authenticate user' },
            { status: 500 }
          );
        }
      }
      
      console.log('Session refreshed successfully');
      
      // Update user metadata with role if we have a new session
      if (newSession && newSession.user) {
        try {
          console.log('Updating user metadata with role:', user.role);
          const { error: metadataUpdateError } = await supabase.auth.admin.updateUserById(
            newSession.user.id,
            { 
              user_metadata: { role: user.role },
              email_confirm: true
            }
          );
          
          if (metadataUpdateError) {
            console.error('Error updating user metadata:', metadataUpdateError);
          } else {
            console.log('User metadata updated with role');
          }
        } catch (metadataError) {
          console.error('Error updating user metadata:', metadataError);
        }
      }
      
      return NextResponse.json(
        { 
          message: 'Session refreshed successfully',
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          authStatus: 'authenticated'
        },
        { status: 200 }
      );
    }
    
    // If we have a session, update the user metadata with the role
    if (session.user) {
      try {
        console.log('Updating existing session user metadata with role:', user.role);
        const { error: metadataUpdateError } = await supabase.auth.admin.updateUserById(
          session.user.id,
          { 
            user_metadata: { role: user.role },
            email_confirm: true
          }
        );
        
        if (metadataUpdateError) {
          console.error('Error updating user metadata:', metadataUpdateError);
        } else {
          console.log('User metadata updated with role');
        }
      } catch (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }
    }
    
    console.log('Returning success response for existing session');
    
    return NextResponse.json(
      { 
        message: 'Session exists and is valid',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        authStatus: 'authenticated'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

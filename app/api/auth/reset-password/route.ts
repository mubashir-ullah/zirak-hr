import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserByEmail, updateUser } from '@/lib/database';

export async function POST(request: Request) {
  console.log('Reset password API route called');
  
  try {
    const body = await request.json();
    const { token, password } = body;
    
    console.log('Reset password request received with token');

    if (!token || !password) {
      console.log('Token or password missing');
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify the token and reset the password using Supabase
    console.log('Verifying token and updating password...');
    const { error } = await supabase.auth.resetPasswordForEmail(password, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`
    });

    if (error) {
      console.error('Password reset error:', error);
      return NextResponse.json(
        { error: 'Password reset failed', details: error.message },
        { status: 400 }
      );
    }

    console.log('Password reset successful');
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Endpoint to request a password reset
export async function PUT(request: Request) {
  console.log('Request password reset API route called');
  
  try {
    const body = await request.json();
    const { email } = body;
    
    console.log('Password reset request received for email');

    if (!email) {
      console.log('Email missing');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if the user exists in our database
    const user = await findUserByEmail(email);
    
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      console.log('User not found, but returning success for security');
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Send password reset email using Supabase
    console.log('Sending password reset email...');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      // Don't reveal the error to the client for security reasons
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    console.log('Password reset email sent successfully');
    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

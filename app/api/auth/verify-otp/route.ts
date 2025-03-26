import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, isEmailVerified } from '@/lib/otp';
import supabase from '@/lib/supabase';
import { createUser, findUserByEmail } from '@/lib/supabaseDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify the OTP
    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if the user exists in our database
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    // Update the user's email_verified status in our custom table
    const { error: updateError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('Error updating user verification status:', updateError);
      return NextResponse.json(
        { message: 'Failed to update verification status' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

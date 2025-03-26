import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, hashOTP, storeOTP } from '@/lib/otp';
import { sendOTPVerificationEmail } from '@/lib/email';
import supabase from '@/lib/supabase';
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

    // Check if the user exists in our database
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    // Generate a new OTP
    const otp = generateOTP();
    
    // Hash the OTP for secure storage
    const hashedOTP = hashOTP(otp, email);
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Store the OTP in the database
    const stored = await storeOTP(email, hashedOTP, expiresAt);
    
    if (!stored) {
      return NextResponse.json(
        { message: 'Failed to generate verification code' },
        { status: 500 }
      );
    }
    
    // Send the OTP via email
    const emailResult = await sendOTPVerificationEmail(email, otp);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { message: 'Failed to send verification code' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resending OTP:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

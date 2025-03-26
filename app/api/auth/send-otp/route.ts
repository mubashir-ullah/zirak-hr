import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, hashOTP, storeOTP } from '@/lib/otp';
import { sendOTPVerificationEmail } from '@/lib/email';
import supabase from '@/lib/supabase';
import { findUserByEmail } from '@/lib/supabaseDb';

export async function POST(request: NextRequest) {
  try {
    console.log('OTP API route called');
    const body = await request.json();
    const { email, name } = body;
    console.log('Request body:', { email, name: name || 'Not provided' });

    if (!email) {
      console.log('Email is required but not provided');
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a new OTP
    console.log('Generating OTP for email:', email);
    const otp = generateOTP();
    console.log('OTP generated successfully:', otp);
    
    // Hash the OTP for secure storage
    const hashedOTP = hashOTP(otp, email);
    console.log('OTP hashed successfully');
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    console.log('OTP expiration set to:', expiresAt.toISOString());
    
    // Store the OTP in the database
    console.log('Attempting to store OTP in database');
    const stored = await storeOTP(email, hashedOTP, expiresAt);
    console.log('OTP storage result:', stored ? 'Success' : 'Failed');
    
    if (!stored) {
      console.error('Failed to store OTP in database');
      return NextResponse.json(
        { message: 'Failed to generate verification code' },
        { status: 500 }
      );
    }
    
    // Send the OTP via email
    console.log('Attempting to send OTP via email');
    const emailResult = await sendOTPVerificationEmail(email, otp);
    console.log('Email sending result:', emailResult.success ? 'Success' : 'Failed', emailResult.message || '');
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.message);
      return NextResponse.json(
        { message: 'Failed to send verification code' },
        { status: 500 }
      );
    }
    
    console.log('OTP process completed successfully');
    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

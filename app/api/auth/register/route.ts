import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { generateOTP, hashOTP, storeOTP } from '@/lib/otp';
import { sendOTPVerificationEmail } from '@/lib/email';
import { createUser } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, organization, position } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Register user with Supabase Auth
    console.log('Registering user with Supabase...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'talent', // Default role
          needs_role_selection: true,
          organization,
          position
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user in our database
    const userData = {
      id: data.user.id,
      email: email.toLowerCase(),
      name,
      role: 'talent',
      needs_role_selection: true,
      needs_profile_completion: true,
      email_verified: false,
      organization,
      position
    };

    const user = await createUser(userData);

    if (!user) {
      console.error('Failed to create user in database');
      // Continue with registration but log the error
    }

    // Generate and send OTP for email verification
    console.log('Generating OTP for email verification...');
    const otp = generateOTP();
    console.log('OTP generated:', otp);
    
    const hashedOTP = hashOTP(otp, email);
    console.log('OTP hashed successfully');
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    console.log('OTP expiration set to:', expiresAt.toISOString());
    
    // Store the OTP in the database
    console.log('Attempting to store OTP in database...');
    const stored = await storeOTP(email, hashedOTP, expiresAt);
    console.log('OTP storage result:', stored ? 'Success' : 'Failed');
    
    if (!stored) {
      console.error('Failed to store OTP');
      // Continue with registration but log the error
    } else {
      // Send the OTP via email
      console.log('Sending OTP verification email to:', email);
      const emailResult = await sendOTPVerificationEmail(email, otp);
      console.log('OTP email sent result:', emailResult);
      
      if (emailResult.previewUrl) {
        console.log('');
        console.log('============================================');
        console.log('📧 TEST EMAIL PREVIEW URL:');
        console.log(emailResult.previewUrl);
        console.log('============================================');
        console.log('');
      }
    }

    console.log('User registered successfully');
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: data.user.id,
        name,
        email,
        role: 'talent',
        organization,
        position,
        needsRoleSelection: true,
        needsEmailVerification: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}

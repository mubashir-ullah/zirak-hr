import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, hashOTP, storeOTP } from '@/lib/otp';
import { sendOTPVerificationEmail } from '@/lib/email';
import supabase from '@/lib/supabase';
import { findUserByEmail, createUser } from '@/lib/supabaseDb';

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
    let user = await findUserByEmail(email);

    // If user not found in our custom table, check Supabase Auth
    if (!user) {
      // Check if user exists in Supabase Auth
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create a new user, just check if one exists
        }
      });
      
      // If we get a response without an error, the user exists in Auth
      if (!error) {
        console.log('User found in Auth but not in custom table, creating user record');
        
        // Get the user ID from the session
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        
        if (userId) {
          // Get the provider from app_metadata if available
          const provider = sessionData.session?.user?.app_metadata?.provider;
          const socialProvider = provider ? String(provider) : undefined;
          
          // Create a user record in our custom table
          const { user: newUser, error: createError } = await createUser({
            id: userId,
            name: sessionData.session?.user?.user_metadata?.name || 'User',
            email: email.toLowerCase(),
            role: 'talent', // Default role, will be updated during role selection
            needs_role_selection: true,
            email_verified: false,
            social_provider: socialProvider
          });
          
          if (createError) {
            console.error('Error creating user record:', createError);
          } else {
            user = newUser;
          }
          
          // Sign out after checking to avoid creating a session
          await supabase.auth.signOut();
        }
      } else {
        console.log('User not found in Auth or custom table');
        // For security, don't reveal if the user exists or not
        // Just proceed with OTP generation as if the user exists
      }
    }

    // Generate a new OTP regardless of whether we found the user or not
    // This prevents user enumeration attacks
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

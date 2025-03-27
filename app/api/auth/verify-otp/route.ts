import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { findUserByEmail, updateUser } from '@/lib/database';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    console.log(`OTP Verification request received for email: ${email}`);

    if (!email || !otp) {
      console.log('Missing required fields in OTP verification request');
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    console.log(`Attempting to verify OTP for email: ${email}`);

    // Verify the OTP
    const isValid = await verifyOTP(email, otp);
    console.log(`OTP verification result: ${isValid ? 'Valid' : 'Invalid'}`);

    if (!isValid) {
      console.log(`Invalid OTP provided for email: ${email}`);
      return NextResponse.json(
        { message: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if the user exists in our database
    console.log(`Looking up user with email: ${email}`);
    const user = await findUserByEmail(email);
    console.log(`User found in database: ${user ? 'Yes' : 'No'}`);

    if (!user) {
      console.error(`User not found for email: ${email}`);
      return NextResponse.json(
        { message: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    try {
      // Update the user's email_verified status in our database
      const userId = user.id || '';
      if (!userId) {
        console.error('User ID is missing');
        return NextResponse.json(
          { message: 'User ID is missing' },
          { status: 500 }
        );
      }

      console.log(`Updating email verification status for user ID: ${userId}`);
      
      // Try to update using the database.ts file first
      let updatedUser = await updateUser(userId, { 
        email_verified: true,
        updated_at: new Date().toISOString()
      });
      
      // If that fails, try direct Supabase update as fallback
      if (!updatedUser) {
        console.log('Fallback: Using direct Supabase update');
        const { data, error } = await supabase
          .from('users')
          .update({ 
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (error) {
          console.error('Error in fallback update:', error);
          throw error;
        }
        
        updatedUser = data;
      }
      
      console.log(`User verification status updated: ${updatedUser ? 'Success' : 'Failed'}`);

      if (!updatedUser) {
        console.error('Error updating user verification status');
        return NextResponse.json(
          { message: 'Failed to update verification status' },
          { status: 500 }
        );
      }

      // Update user metadata in Supabase Auth
      console.log('Updating Supabase Auth user metadata');
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: { 
            ...user,
            email_verified: true
          }
        }
      );

      if (updateAuthError) {
        console.error('Error updating user metadata:', updateAuthError);
        // Continue anyway since we've updated our database
      } else {
        console.log('Supabase Auth user metadata updated successfully');
      }

      console.log('Email verification completed successfully');
      return NextResponse.json(
        { 
          message: 'Email verified successfully',
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            needsRoleSelection: updatedUser.needs_role_selection,
            needsProfileCompletion: updatedUser.needs_profile_completion,
            emailVerified: true
          }
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error during verification:', dbError);
      return NextResponse.json(
        { message: 'Database error during verification process' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred during verification' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToMongoose } from '@/lib/mongoose';
import { User } from '@/app/models/user';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  console.log('Forgot password API route called');
  
  try {
    const body = await request.json();
    const { email } = body;
    
    console.log('Email received:', email);

    if (!email) {
      console.log('Email is required but was not provided');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB through mongoose
    try {
      console.log('Attempting to connect to MongoDB...');
      await connectToMongoose();
      console.log('MongoDB connection successful');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }

    try {
      // Find user by email
      console.log('Finding user by email:', email);
      const user = await User.findOne({ email });
      
      console.log('User found?', !!user);
      
      // If user doesn't exist, still return success to prevent email enumeration
      if (!user) {
        console.log('User not found, returning generic success message');
        return NextResponse.json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link'
        });
      }

      // Generate reset token
      console.log('Generating reset token');
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set token expiration (1 hour from now)
      const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour
      
      // Save token to user
      console.log('Saving token to user');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiration;
      
      try {
        await user.save();
        console.log('User saved with reset token');
      } catch (saveError) {
        console.error('Error saving user with reset token:', saveError);
        return NextResponse.json(
          { error: 'Failed to save reset token', details: saveError instanceof Error ? saveError.message : String(saveError) },
          { status: 500 }
        );
      }

      // Get base URL from request or environment
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      console.log('Base URL for reset link:', baseUrl);
      
      // Send password reset email
      try {
        console.log('Attempting to send password reset email');
        const emailResult = await sendPasswordResetEmail(email, resetToken, baseUrl);
        
        if (!emailResult.success) {
          console.error('Failed to send email:', emailResult.message);
          
          // For development, provide the token in the response
          if (process.env.NODE_ENV !== 'production') {
            console.log('Returning development token information');
            return NextResponse.json({
              success: true,
              message: 'Password reset token generated, but email sending failed. In development mode, you can use the token directly:',
              devToken: resetToken,
              resetUrl: `${baseUrl}/reset-password?token=${resetToken}`,
              emailError: emailResult.message
            });
          }
          
          return NextResponse.json(
            { error: 'Failed to send password reset email', details: emailResult.message },
            { status: 500 }
          );
        }

        console.log('Password reset email sent successfully');
        
        // In development, return the preview URL
        if (process.env.NODE_ENV !== 'production' && emailResult.previewUrl) {
          return NextResponse.json({
            success: true,
            message: 'Password reset email sent. In development mode, you can view the email at the preview URL:',
            previewUrl: emailResult.previewUrl,
            devToken: resetToken,
            resetUrl: `${baseUrl}/reset-password?token=${resetToken}`
          });
        }
        
        // In production, just return success
        return NextResponse.json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link'
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        
        // For development, provide the token in the response
        if (process.env.NODE_ENV !== 'production') {
          console.log('Returning development token information after email error');
          return NextResponse.json({
            success: true,
            message: 'Password reset token generated, but email sending failed. In development mode, you can use the token directly:',
            devToken: resetToken,
            resetUrl: `${baseUrl}/reset-password?token=${resetToken}`,
            emailError: emailError instanceof Error ? emailError.message : String(emailError)
          });
        }
        
        return NextResponse.json(
          { error: 'Failed to send password reset email', details: emailError instanceof Error ? emailError.message : String(emailError) },
          { status: 500 }
        );
      }
    } catch (userError) {
      console.error('User processing error:', userError);
      return NextResponse.json(
        { error: 'Error processing user data', details: userError instanceof Error ? userError.message : String(userError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

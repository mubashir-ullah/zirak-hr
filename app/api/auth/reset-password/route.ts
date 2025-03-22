import { NextResponse } from 'next/server';
import { connectToMongoose } from '@/lib/mongoose';
import { User } from '@/app/models/user';
import bcrypt from 'bcryptjs';

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

    // Connect to MongoDB
    try {
      console.log('Connecting to MongoDB...');
      await connectToMongoose();
      console.log('MongoDB connection successful');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }

    // Find user with valid reset token
    console.log('Finding user with reset token...');
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired token');
      return NextResponse.json(
        { error: 'Password reset token is invalid or has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    console.log('Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    console.log('Updating user password...');
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    try {
      await user.save();
      console.log('Password reset successful');
    } catch (saveError) {
      console.error('Error saving user with new password:', saveError);
      return NextResponse.json(
        { error: 'Failed to update password', details: saveError instanceof Error ? saveError.message : String(saveError) },
        { status: 500 }
      );
    }

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

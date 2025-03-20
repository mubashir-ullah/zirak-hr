import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/app/models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'zirak-hr-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // Connect to MongoDB
    await connectToDatabase();

    // Find user
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      authenticated: true,
      user
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', authenticated: false },
      { status: 401 }
    );
  }
}

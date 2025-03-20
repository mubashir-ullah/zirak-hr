import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { UserSettings } from '../../../models/userSettings';

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    
    // Get the userId from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would implement additional security checks here
    // such as password confirmation, 2FA verification, etc.
    
    // Delete user settings
    await UserSettings.deleteOne({ userId });
    
    // In a real app, you would also delete other user data from various collections
    // such as user profile, saved candidates, job applications, etc.
    
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

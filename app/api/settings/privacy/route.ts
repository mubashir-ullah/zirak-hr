import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { UserSettings } from '../../../models/userSettings';

// GET endpoint to retrieve privacy settings
export async function GET(request: Request) {
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
    
    // Find the user settings
    const userSettings = await UserSettings.findOne({ userId });
    
    if (!userSettings) {
      return NextResponse.json(
        { error: 'User settings not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(userSettings.privacy);
    
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update privacy settings
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, privacy } = body;
    
    if (!userId || !privacy) {
      return NextResponse.json(
        { error: 'User ID and privacy settings are required' },
        { status: 400 }
      );
    }
    
    // Find and update the user settings
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { privacy } },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
      privacy: updatedSettings.privacy
    });
    
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

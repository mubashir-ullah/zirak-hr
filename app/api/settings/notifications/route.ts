import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { UserSettings } from '../../../models/userSettings';

// GET endpoint to retrieve notification settings
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
    
    return NextResponse.json(userSettings.notifications);
    
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update notification settings
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, notifications } = body;
    
    if (!userId || !notifications) {
      return NextResponse.json(
        { error: 'User ID and notification settings are required' },
        { status: 400 }
      );
    }
    
    // Find and update the user settings
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { notifications } },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      notifications: updatedSettings.notifications
    });
    
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}

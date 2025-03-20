import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { UserSettings } from '../../models/userSettings';

// GET endpoint to retrieve user settings
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
    let userSettings = await UserSettings.findOne({ userId });
    
    // If no settings exist, create default settings
    if (!userSettings) {
      // In a real app, you would get the email from the user's profile
      const defaultEmail = 'user@example.com';
      
      userSettings = await UserSettings.create({
        userId,
        account: {
          email: defaultEmail,
        },
      });
    }
    
    return NextResponse.json(userSettings);
    
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update user settings
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, settings } = body;
    
    if (!userId || !settings) {
      return NextResponse.json(
        { error: 'User ID and settings are required' },
        { status: 400 }
      );
    }
    
    // Find and update the user settings
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: settings },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
    
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}

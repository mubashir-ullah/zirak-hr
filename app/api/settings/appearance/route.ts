import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { UserSettings } from '../../../models/userSettings';

// GET endpoint to retrieve appearance settings
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
    
    return NextResponse.json(userSettings.appearance);
    
  } catch (error) {
    console.error('Error fetching appearance settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appearance settings' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update appearance settings
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, appearance } = body;
    
    if (!userId || !appearance) {
      return NextResponse.json(
        { error: 'User ID and appearance settings are required' },
        { status: 400 }
      );
    }
    
    // Find and update the user settings
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { appearance } },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Appearance settings updated successfully',
      appearance: updatedSettings.appearance
    });
    
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    return NextResponse.json(
      { error: 'Failed to update appearance settings' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { UserSettings } from '../../../models/userSettings';

// GET endpoint to retrieve account settings
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
    
    return NextResponse.json(userSettings.account);
    
  } catch (error) {
    console.error('Error fetching account settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account settings' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update account settings
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, account } = body;
    
    if (!userId || !account) {
      return NextResponse.json(
        { error: 'User ID and account settings are required' },
        { status: 400 }
      );
    }
    
    // Find and update the user settings
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { account } },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Account settings updated successfully',
      account: updatedSettings.account
    });
    
  } catch (error) {
    console.error('Error updating account settings:', error);
    return NextResponse.json(
      { error: 'Failed to update account settings' },
      { status: 500 }
    );
  }
}

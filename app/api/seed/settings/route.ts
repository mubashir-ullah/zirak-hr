import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { User } from '../../../models/user';
import { UserSettings } from '../../../models/userSettings';

// This endpoint will seed the database with sample user and settings data
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Check if we already have users
    const userCount = await User.countDocuments();
    
    // Sample users data
    const users = [
      {
        name: 'Ahmed Khan',
        email: 'ahmed.khan@techinnovations.com',
        phone: '+92 300 1234567',
        role: 'hr_manager',
        department: 'Human Resources',
        company: 'Tech Innovations',
        profileImage: '/avatars/ahmed.jpg',
      },
      {
        name: 'Sarah Ahmed',
        email: 'sarah.ahmed@techinnovations.com',
        phone: '+92 301 9876543',
        role: 'recruiter',
        department: 'Talent Acquisition',
        company: 'Tech Innovations',
        profileImage: '/avatars/sarah.jpg',
      },
      {
        name: 'Muhammad Ali',
        email: 'muhammad.ali@techinnovations.com',
        phone: '+92 302 5551234',
        role: 'admin',
        department: 'Executive',
        company: 'Tech Innovations',
        profileImage: '/avatars/muhammad.jpg',
      }
    ];
    
    let createdUsers = [];
    
    // Only seed if we don't have users yet
    if (userCount === 0) {
      createdUsers = await User.insertMany(users);
      console.log('Users seeded successfully');
    } else {
      createdUsers = await User.find();
      console.log('Using existing users');
    }
    
    // Check if we already have settings
    const settingsCount = await UserSettings.countDocuments();
    
    // Create settings for each user if they don't exist
    if (settingsCount === 0) {
      const settingsPromises = createdUsers.map(user => {
        return UserSettings.create({
          userId: user._id.toString(),
          notifications: {
            emailNotifications: true,
            applicationUpdates: true,
            messageNotifications: true,
            marketingEmails: user.role === 'recruiter' // Only recruiters get marketing emails by default
          },
          privacy: {
            profileVisibility: 'all',
            activityTracking: true,
            dataSharing: false
          },
          account: {
            email: user.email,
            phone: user.phone,
            twoFactorAuth: user.role === 'admin' // Admins have 2FA enabled by default
          },
          appearance: {
            theme: 'system',
            language: 'en',
            compactView: false
          }
        });
      });
      
      await Promise.all(settingsPromises);
      console.log('Settings seeded successfully');
    } else {
      console.log('Using existing settings');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      users: createdUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }))
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

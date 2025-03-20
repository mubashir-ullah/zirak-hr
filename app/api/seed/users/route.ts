import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { User } from '../../../models/user';
import mongoose from 'mongoose';

// This endpoint will seed the database with sample users
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Check if we already have users
    const userCount = await User.countDocuments();
    
    // Only seed if we don't have users yet
    if (userCount === 0) {
      // Sample users data
      const users = [
        {
          name: 'Ahmed Khan',
          email: 'ahmed@zirakhr.com',
          password: 'password123',
          phone: '+92 300 1234567',
          role: 'hr_manager',
          department: 'Human Resources',
          company: 'Tech Innovations',
          profileImage: '/avatars/ahmed.jpg',
        },
        {
          name: 'Sarah Ahmed',
          email: 'sarah@zirakhr.com',
          password: 'password123',
          phone: '+92 301 9876543',
          role: 'recruiter',
          department: 'Talent Acquisition',
          company: 'Tech Innovations',
          profileImage: '/avatars/sarah.jpg',
        },
        {
          name: 'Muhammad Ali',
          email: 'ali@zirakhr.com',
          password: 'password123',
          phone: '+92 302 5551234',
          role: 'admin',
          department: 'Executive',
          company: 'Tech Innovations',
          profileImage: '/avatars/muhammad.jpg',
        },
        {
          name: 'Fatima Khan',
          email: 'fatima@zirakhr.com',
          password: 'password123',
          phone: '+92 303 7778888',
          role: 'candidate',
          department: '',
          company: 'Job Seeker',
          profileImage: '/avatars/fatima.jpg',
        }
      ];
      
      // Create users
      await User.create(users);
      console.log('Users seeded successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Users seeded successfully',
        count: users.length
      });
    } else {
      console.log('Users already exist, skipping seed');
      
      return NextResponse.json({
        success: true,
        message: 'Users already exist, skipping seed',
        count: userCount
      });
    }
    
  } catch (error) {
    console.error('Error seeding users:', error);
    return NextResponse.json(
      { error: 'Failed to seed users' },
      { status: 500 }
    );
  }
}

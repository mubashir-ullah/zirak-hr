import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import { User, IUser } from '@/models/User'

// Extended user interface with settings properties
interface IUserWithSettings extends IUser {
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    jobAlerts: boolean;
    applicationUpdates: boolean;
    marketingEmails: boolean;
  };
  privacy?: {
    profileVisibility: 'public' | 'private' | 'connections';
    showOnlineStatus: boolean;
    allowMessaging: boolean;
    allowProfileIndexing: boolean;
  };
  twoFactorEnabled?: boolean;
}

// GET handler to fetch user settings
export async function GET(req: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { db } = await connectToDatabase()
    
    // Find the user by email
    const userDoc = await db.collection('users').findOne({ email: session.user.email })
    
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Cast the document to our extended user interface
    const user = userDoc as IUserWithSettings
    
    // Return the user settings
    return NextResponse.json({
      settings: {
        email: user.email,
        name: user.name,
        language: user.language || 'en',
        notifications: user.notifications || {
          email: true,
          push: true,
          sms: false,
          jobAlerts: true,
          applicationUpdates: true,
          marketingEmails: false,
        },
        privacy: user.privacy || {
          profileVisibility: 'public',
          showOnlineStatus: true,
          allowMessaging: true,
          allowProfileIndexing: true,
        },
        twoFactorEnabled: user.twoFactorEnabled || false
      }
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT handler to update user settings
export async function PUT(req: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { db } = await connectToDatabase()
    
    // Parse the request body
    const { settings } = await req.json()
    
    // Find the user by email
    const userDoc = await db.collection('users').findOne({ email: session.user.email })
    
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Cast the document to our extended user interface
    const user = userDoc as IUserWithSettings
    
    // Update fields to save
    const updateFields: Partial<IUserWithSettings> = {
      updatedAt: new Date()
    }
    
    // Only update fields that are provided and allowed to be updated
    if (settings.name) updateFields.name = settings.name
    if (settings.language) updateFields.language = settings.language
    if (settings.notifications) updateFields.notifications = settings.notifications
    if (settings.privacy) updateFields.privacy = settings.privacy
    if (settings.twoFactorEnabled !== undefined) updateFields.twoFactorEnabled = settings.twoFactorEnabled
    
    // If password is provided and not empty, update it
    if (settings.password && settings.password.trim() !== '') {
      // In a real application, you would hash the password here
      // For example: updateFields.password = await bcrypt.hash(settings.password, 10)
      updateFields.password = settings.password // This is simplified for the example
    }
    
    // Save the updated user
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updateFields }
    )
    
    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: {
        email: user.email,
        name: settings.name || user.name,
        language: settings.language || user.language,
        notifications: settings.notifications || user.notifications,
        privacy: settings.privacy || user.privacy,
        twoFactorEnabled: settings.twoFactorEnabled !== undefined 
          ? settings.twoFactorEnabled 
          : user.twoFactorEnabled
      }
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

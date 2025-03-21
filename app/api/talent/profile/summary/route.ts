import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Connect to the database
    const { db } = await connectToDatabase()
    
    // Find the user profile
    const userProfile = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { 
        fullName: 1, 
        title: 1, 
        profilePicture: 1,
        _id: 0 
      }}
    )
    
    if (!userProfile) {
      return NextResponse.json(
        { profile: { fullName: '', title: '', profilePicture: '' } },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      { profile: userProfile },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error fetching profile summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile summary' },
      { status: 500 }
    )
  }
}

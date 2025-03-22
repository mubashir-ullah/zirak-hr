import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models/User'
import { ObjectId } from 'mongodb'

// DELETE handler to delete user account
export async function DELETE(req: NextRequest) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const db = await connectToDatabase()
    
    // Find the user by email
    const user = await User.findByEmail(db, session.user.email as string)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Delete user's job applications
    await db.db.collection('jobApplications').deleteMany({ userId: user._id })
    
    // Delete the user
    await db.db.collection('users').deleteOne({ _id: user._id })
    
    return NextResponse.json({
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

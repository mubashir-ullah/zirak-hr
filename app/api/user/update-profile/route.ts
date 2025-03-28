import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await req.json()
    const { name, position, phone, bio, website, linkedin, twitter } = data
    
    const client = await clientPromise
    const db = client.db()
    
    // Update user profile
    await db.collection('users').updateOne(
      { email: session.user.email },
      { 
        $set: { 
          name,
          position,
          phone,
          bio,
          website,
          linkedin,
          twitter,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    )
    
    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

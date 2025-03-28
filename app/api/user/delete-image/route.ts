import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await req.json()
    
    if (!type || (type !== 'profile' && type !== 'company')) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
    }

    const client = await clientPromise
    
    if (!client) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    
    const db = client.db()
    
    // Get current image URL
    let currentImageUrl = ''
    
    if (type === 'profile') {
      const user = await db.collection('users').findOne({ email: session.user.email })
      currentImageUrl = user?.profilePicture || ''
    } else {
      const company = await db.collection('companies').findOne({ userEmail: session.user.email })
      currentImageUrl = company?.logoUrl || ''
    }
    
    // If there's no image to delete
    if (!currentImageUrl) {
      return NextResponse.json({ success: true, message: 'No image to delete' })
    }
    
    // Extract filename from URL
    const filename = currentImageUrl.split('/').pop()
    
    if (!filename) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }
    
    // Path to the file
    const filePath = join(process.cwd(), 'public', 'uploads', filename)
    
    // Delete the file if it exists
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
    
    // Update the database
    if (type === 'profile') {
      await db.collection('users').updateOne(
        { email: session.user.email },
        { $set: { profilePicture: '', updatedAt: new Date() } }
      )
    } else {
      await db.collection('companies').updateOne(
        { userEmail: session.user.email },
        { $set: { logoUrl: '', updatedAt: new Date() } }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${type === 'profile' ? 'Profile picture' : 'Company logo'} deleted successfully` 
    })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}

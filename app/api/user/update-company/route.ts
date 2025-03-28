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
    const { 
      companyName, 
      industry, 
      size, 
      founded, 
      description, 
      website, 
      location,
      logoUrl 
    } = data
    
    const client = await clientPromise
    const db = client.db()
    
    // Update company information
    await db.collection('companies').updateOne(
      { userEmail: session.user.email },
      { 
        $set: { 
          companyName,
          industry,
          size,
          founded,
          description,
          website,
          location,
          logoUrl,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    )
    
    return NextResponse.json({ success: true, message: 'Company information updated successfully' })
  } catch (error) {
    console.error('Error updating company information:', error)
    return NextResponse.json({ error: 'Failed to update company information' }, { status: 500 })
  }
}

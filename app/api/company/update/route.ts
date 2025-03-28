import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    
    // Validate required fields
    if (!data.companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db()
    
    // Check if user exists
    const user = await db.collection('users').findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if company already exists for this user
    const existingCompany = await db.collection('companies').findOne({ userEmail: session.user.email })
    
    // Prepare company data
    const companyData = {
      companyName: data.companyName,
      industry: data.industry || '',
      size: data.size || '',
      location: data.location || '',
      website: data.website || '',
      description: data.description || '',
      logoUrl: data.logoUrl || '',
      userEmail: session.user.email,
      updatedAt: new Date()
    }
    
    let result
    
    if (existingCompany) {
      // Update existing company
      result = await db.collection('companies').updateOne(
        { userEmail: session.user.email },
        { $set: companyData }
      )
    } else {
      // Create new company
      companyData.createdAt = new Date()
      result = await db.collection('companies').insertOne(companyData)
    }
    
    // Update user's role to HR if not already set
    await db.collection('users').updateOne(
      { email: session.user.email },
      { 
        $set: { 
          role: user.role || 'hr',
          updatedAt: new Date()
        } 
      }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: existingCompany ? 'Company information updated' : 'Company information created',
      companyId: existingCompany ? existingCompany._id.toString() : result.insertedId.toString()
    })
  } catch (error) {
    console.error('Error updating company information:', error)
    return NextResponse.json({ error: 'Failed to update company information' }, { status: 500 })
  }
}

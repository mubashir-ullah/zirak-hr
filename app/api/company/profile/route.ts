import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import clientPromise from '@/lib/mongodb'
import { ObjectId, InsertOneResult, UpdateResult } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const client = await clientPromise
    if (!client) {
      throw new Error('Failed to connect to database')
    }
    
    const db = client.db()
    
    // Get company information
    const company = await db.collection('companies').findOne(
      { userEmail: session.user.email },
      { projection: { _id: 0 } }
    )
    
    return NextResponse.json({ 
      success: true, 
      company: company || {} 
    })
  } catch (error) {
    console.error('Error fetching company profile:', error)
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
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
    if (!client) {
      throw new Error('Failed to connect to database')
    }
    
    const db = client.db()
    
    // Check if company already exists for this user
    const existingCompany = await db.collection('companies').findOne({ userEmail: session.user.email })
    
    // Prepare company data
    const companyData: {
      companyName: string;
      industry: string;
      size: string;
      founded: string;
      description: string;
      website: string;
      location: string;
      logoUrl: string;
      userEmail: string;
      updatedAt: Date;
      createdAt?: Date;
    } = {
      companyName: data.companyName,
      industry: data.industry || '',
      size: data.size || '',
      founded: data.founded || '',
      description: data.description || '',
      website: data.website || '',
      location: data.location || '',
      logoUrl: data.logoUrl || '',
      userEmail: session.user.email as string,
      updatedAt: new Date()
    }
    
    let result: UpdateResult | InsertOneResult
    
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
          role: 'hr',
          updatedAt: new Date()
        } 
      }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: existingCompany ? 'Company information updated' : 'Company information created',
      companyId: existingCompany ? existingCompany._id.toString() : (result as InsertOneResult).insertedId.toString()
    })
  } catch (error) {
    console.error('Error updating company profile:', error)
    return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 })
  }
}

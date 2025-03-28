import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    console.log('Update role API called')
    
    // Verify the user is authenticated
    const session = await getServerSession()
    console.log('Session in update-role API:', session ? JSON.stringify(session) : 'No session')
    
    if (!session || !session.user) {
      console.error('Unauthorized: No session or user')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', JSON.stringify(body))
    
    const { email, role, organization, position, skills, experience } = body

    // Validate required fields
    if (!email || !role) {
      console.error('Missing required fields:', { email, role })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate that the email matches the authenticated user
    if (email.toLowerCase() !== session.user.email?.toLowerCase()) {
      console.error('Email mismatch:', { 
        requestEmail: email.toLowerCase(), 
        sessionEmail: session.user.email?.toLowerCase() 
      })
      return NextResponse.json(
        { error: 'Email does not match authenticated user' },
        { status: 403 }
      )
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...')
    let client
    try {
      client = await clientPromise
      if (!client) {
        throw new Error('MongoDB client is null')
      }
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      )
    }

    const db = client.db('zirakhr')
    console.log('Connected to MongoDB successfully')

    // Find the user
    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.error('User not found:', email.toLowerCase())
      
      // If user doesn't exist in the database, create a new one
      console.log('Creating new user with role:', role)
      
      // Generate a random password for the user
      const randomPassword = Math.random().toString(36).slice(2, 10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const newUser = {
        name: session.user.name || email.split('@')[0],
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role,
        needsRoleSelection: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await usersCollection.insertOne(newUser)
      console.log('Created new user:', result.insertedId)
      
      // Create role-specific profile
      if (role === 'talent') {
        await createTalentProfile(db, result.insertedId, skills, experience)
      } else if (role === 'hiring_manager') {
        await createRecruiterProfile(db, result.insertedId, organization, position)
      }
      
      return NextResponse.json(
        { 
          message: 'User created and role set successfully',
          user: {
            id: result.insertedId,
            email: email.toLowerCase(),
            name: session.user.name,
            role: role,
            needsRoleSelection: false
          }
        },
        { status: 201 }
      )
    }

    // Update the user's role and additional fields if provided
    const updateData: any = {
      role,
      needsRoleSelection: false,
      updatedAt: new Date()
    }

    // Add role-specific data
    if (role === 'talent') {
      // For talent users
      if (skills) updateData.skills = skills
      if (experience) updateData.experience = experience
      
      // Create or update talent profile
      await createOrUpdateTalentProfile(db, user._id, skills, experience)
    } else if (role === 'hiring_manager') {
      // For hiring manager users
      if (organization) updateData.organization = organization
      if (position) updateData.position = position
      
      // Create or update recruiter profile
      await createOrUpdateRecruiterProfile(db, user._id, organization, position)
    }

    // Update the user in the database
    console.log('Updating user with data:', updateData)
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      console.error('Failed to update user role:', { email, role })
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    console.log(`Updated role for user ${email} to ${role}`)

    return NextResponse.json(
      { 
        message: 'User role updated successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: role,
          needsRoleSelection: false
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Role update error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions for profile management
async function createOrUpdateTalentProfile(db: any, userId: any, skills: any, experience: string) {
  const talentProfilesCollection = db.collection('talentProfiles')
  const existingProfile = await talentProfilesCollection.findOne({ userId })
  
  if (existingProfile) {
    await talentProfilesCollection.updateOne(
      { userId },
      { 
        $set: { 
          skills: skills || existingProfile.skills,
          experience: experience || existingProfile.experience,
          updatedAt: new Date()
        } 
      }
    )
  } else {
    await createTalentProfile(db, userId, skills, experience)
  }
}

async function createTalentProfile(db: any, userId: any, skills: any, experience: string) {
  const talentProfilesCollection = db.collection('talentProfiles')
  await talentProfilesCollection.insertOne({
    userId,
    skills: skills || [],
    experience: experience || '',
    applications: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

async function createOrUpdateRecruiterProfile(db: any, userId: any, organization: string, position: string) {
  const recruiterProfilesCollection = db.collection('recruiterProfiles')
  const existingProfile = await recruiterProfilesCollection.findOne({ userId })
  
  if (existingProfile) {
    await recruiterProfilesCollection.updateOne(
      { userId },
      { 
        $set: { 
          organization: organization || existingProfile.organization,
          position: position || existingProfile.position,
          updatedAt: new Date()
        } 
      }
    )
  } else {
    await createRecruiterProfile(db, userId, organization, position)
  }
}

async function createRecruiterProfile(db: any, userId: any, organization: string, position: string) {
  const recruiterProfilesCollection = db.collection('recruiterProfiles')
  await recruiterProfilesCollection.insertOne({
    userId,
    organization: organization || '',
    position: position || '',
    jobPostings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

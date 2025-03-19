import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role, organization, position } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // Check if user already exists
    console.log('Checking for existing user...')
    const existingUser = await User.findByEmail(db, email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    console.log('Creating new user...')
    const user = await User.create(db, {
      name,
      email,
      password: hashedPassword,
      role,
      ...(role === 'hiring_manager' ? { organization, position } : {})
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    console.log('User created successfully:', userWithoutPassword)

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
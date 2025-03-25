import { NextResponse } from 'next/server'
import { signUpWithEmail } from '@/lib/supabaseAuth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, organization, position } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Register user with Supabase
    console.log('Registering user with Supabase...')
    const { user, error } = await signUpWithEmail(
      email,
      password,
      name,
      'talent', // Default role
      true // Needs role selection
    )

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json(
        { error: error },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Update user with additional information if provided
    // This is handled in the signUpWithEmail function

    console.log('User registered successfully')
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        position: user.position,
        needsRoleSelection: user.needs_role_selection
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
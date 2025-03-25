import { NextResponse } from 'next/server'
import { signInWithEmail } from '@/lib/supabaseAuth'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'zirak-hr-secret-key'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate with Supabase
    const { user, error } = await signInWithEmail(email, password)
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = sign(
      { 
        userId: user.id,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set cookie using the synchronous cookies API
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Return user data (excluding password)
    const { password: _, ...userData } = user

    return NextResponse.json({
      user: userData,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
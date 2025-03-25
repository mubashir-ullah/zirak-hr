import { NextResponse } from 'next/server'
import { signInWithEmail } from '@/lib/supabaseAuth'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'zirak-hr-secret-key'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

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

    // Create JWT token with expiration based on rememberMe
    const expiresIn = rememberMe ? '30d' : '1d'
    
    const token = sign(
      { 
        userId: user.id,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn }
    )

    // Create a response object
    const response = NextResponse.json({
      message: 'Login successful',
      user: { ...user, password: undefined }
    })

    // Set cookie on the response object
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days if remember me, else 1 day
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
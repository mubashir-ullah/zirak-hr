import { NextResponse, NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { findUserById } from './lib/supabaseDb'

// Define protected routes by role
const talentRoutes = [
  '/dashboard/talent',
  '/dashboard/talent/profile',
  '/dashboard/talent/jobs',
  '/dashboard/talent/applications',
  '/dashboard/talent/settings',
  '/dashboard/talent/skill-tests',
]

const hiringManagerRoutes = [
  '/dashboard/hiring-manager',
  '/dashboard/hiring-manager/profile',
  '/dashboard/hiring-manager/talent-pool',
  '/dashboard/hiring-manager/jobs',
  '/dashboard/hiring-manager/analytics',
  '/dashboard/hiring-manager/settings',
  '/dashboard/hiring-manager/applicant-pool',
  '/dashboard/hiring-manager/manage-jobs',
]

const adminRoutes = [
  '/dashboard/admin',
  '/dashboard/admin/profile',
  '/dashboard/admin/user-management',
  '/dashboard/admin/system-config',
  '/dashboard/admin/analytics',
  '/dashboard/admin/settings',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/dashboard/role-selection',
  '/api/auth/set-role',
  '/api/auth/get-user-role',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp',
  '/api/auth/send-otp',
  '/api/auth/get-user',
  '/api/auth/create-user',
]

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl
    
    console.log('Middleware - Path:', pathname)
    
    // Create a Supabase client for the middleware
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    
    // Get the session from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('Middleware - Session:', session ? 'Session exists' : 'No session')
    
    // Allow public routes without authentication
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return res
    }
    
    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
      // If no session, redirect to login
      if (!session) {
        console.log('Middleware - No session, redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      // Special case for role selection page
      if (pathname === '/dashboard/role-selection') {
        return res
      }
      
      // Get user data from our database
      const user = await findUserById(session.user.id)
      
      if (!user) {
        console.log('Middleware - User not found in database')
        return NextResponse.redirect(new URL('/register', req.url))
      }
      
      // Check if email is verified
      if (!user.email_verified) {
        console.log('Middleware - Email not verified')
        return NextResponse.redirect(new URL(`/verify-email?email=${encodeURIComponent(user.email)}`, req.url))
      }
      
      // Check if user needs to select a role
      if (!user.role || user.needs_role_selection) {
        console.log('Middleware - User needs to select a role')
        return NextResponse.redirect(new URL('/dashboard/role-selection', req.url))
      }
      
      // Check role-specific access
      if (user.role === 'talent') {
        if (hiringManagerRoutes.some(route => pathname.startsWith(route)) || 
            adminRoutes.some(route => pathname.startsWith(route))) {
          console.log('Middleware - Talent user trying to access hiring manager or admin route')
          return NextResponse.redirect(new URL('/dashboard/talent', req.url))
        }
      } else if (user.role === 'hiring_manager') {
        if (talentRoutes.some(route => pathname.startsWith(route)) || 
            adminRoutes.some(route => pathname.startsWith(route))) {
          console.log('Middleware - Hiring manager trying to access talent or admin route')
          return NextResponse.redirect(new URL('/dashboard/hiring-manager', req.url))
        }
      } else if (user.role === 'admin') {
        // Admin can access all routes
      } else {
        // Unknown role
        console.log('Middleware - Unknown role')
        return NextResponse.redirect(new URL('/dashboard/role-selection', req.url))
      }
    }
    
    // Allow access to API routes with valid session
    if (pathname.startsWith('/api/dashboard')) {
      if (!session) {
        console.log('Middleware - API request without session')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, redirect to login
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/verify-email',
    '/api/auth/:path*',
  ],
}
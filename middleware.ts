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
    
    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
      // If user is not authenticated, redirect to login
      if (!session) {
        console.log('Middleware - No session, redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      // Get the user data from our database
      const user = await findUserById(session.user.id)
      
      if (!user) {
        console.log('Middleware - User not found in database')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      console.log('Middleware - User:', {
        id: user.id,
        role: user.role,
        needsRoleSelection: user.needs_role_selection
      })
      
      // If user needs to select a role, redirect to role selection page
      // unless they're already on that page
      if (user.needs_role_selection && pathname !== '/dashboard/role-selection') {
        console.log('Middleware - User needs role selection, redirecting')
        return NextResponse.redirect(new URL('/dashboard/role-selection', req.url))
      }
      
      // If user is on role selection page but doesn't need to select a role,
      // redirect to appropriate dashboard
      if (pathname === '/dashboard/role-selection' && !user.needs_role_selection) {
        console.log('Middleware - User already has role, redirecting to dashboard')
        
        if (user.role === 'talent') {
          return NextResponse.redirect(new URL('/dashboard/talent', req.url))
        } else if (user.role === 'hiring_manager') {
          return NextResponse.redirect(new URL('/dashboard/hiring-manager', req.url))
        } else if (user.role === 'admin') {
          return NextResponse.redirect(new URL('/dashboard/admin', req.url))
        }
      }
      
      // Check if user is trying to access a role-specific route they don't have access to
      if (user.role === 'talent' && hiringManagerRoutes.some(route => pathname.startsWith(route))) {
        console.log('Middleware - Talent trying to access hiring manager route')
        return NextResponse.redirect(new URL('/dashboard/talent', req.url))
      }
      
      if (user.role === 'hiring_manager' && talentRoutes.some(route => pathname.startsWith(route))) {
        console.log('Middleware - Hiring manager trying to access talent route')
        return NextResponse.redirect(new URL('/dashboard/hiring-manager', req.url))
      }
      
      // Only admins can access admin routes
      if (user.role !== 'admin' && adminRoutes.some(route => pathname.startsWith(route))) {
        console.log('Middleware - Non-admin trying to access admin route')
        
        if (user.role === 'talent') {
          return NextResponse.redirect(new URL('/dashboard/talent', req.url))
        } else {
          return NextResponse.redirect(new URL('/dashboard/hiring-manager', req.url))
        }
      }
    }
    
    // Allow the request to continue
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
    '/api/protected/:path*',
  ],
}
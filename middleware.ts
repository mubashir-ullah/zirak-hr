import { NextResponse, NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { findUserById } from './lib/supabaseDb'

// Define protected routes by role
const talentRoutes = [
  '/talent/dashboard',
  '/talent/dashboard/profile',
  '/talent/dashboard/jobs',
  '/talent/dashboard/applications',
  '/talent/dashboard/settings',
  '/talent/dashboard/skill-tests',
  '/dashboard/talent',
  '/dashboard/talent/profile',
  '/dashboard/talent/jobs',
  '/dashboard/talent/applications',
  '/dashboard/talent/settings',
  '/dashboard/talent/skill-tests',
]

const hiringManagerRoutes = [
  '/hiring-manager/dashboard',
  '/hiring-manager/dashboard/profile',
  '/hiring-manager/dashboard/talent-pool',
  '/hiring-manager/dashboard/jobs',
  '/hiring-manager/dashboard/analytics',
  '/hiring-manager/dashboard/settings',
  '/hiring-manager/dashboard/applicant-pool',
  '/hiring-manager/dashboard/manage-jobs',
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
  '/admin/dashboard',
  '/admin/dashboard/profile',
  '/admin/dashboard/user-management',
  '/admin/dashboard/system-config',
  '/admin/dashboard/analytics',
  '/admin/dashboard/settings',
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
  '/role-selection',
  '/dashboard/role-selection',
  '/about',
  '/features',
  '/api/auth/set-role',
  '/api/auth/get-user-role',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp',
  '/api/auth/send-otp',
  '/api/auth/get-user',
  '/api/auth/create-user',
  '/api/auth/callback',
  '/auth/callback',
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
      if (pathname === '/dashboard/role-selection' || pathname === '/role-selection') {
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
        return NextResponse.redirect(new URL('/role-selection', req.url))
      }
      
      // Check role-specific access
      if (user.role === 'talent') {
        // If talent user is trying to access the dashboard root, redirect to talent dashboard
        if (pathname === '/dashboard') {
          console.log('Middleware - Redirecting talent user to talent dashboard')
          return NextResponse.redirect(new URL('/talent/dashboard', req.url))
        }
        
        if (hiringManagerRoutes.some(route => pathname.startsWith(route)) || 
            adminRoutes.some(route => pathname.startsWith(route))) {
          console.log('Middleware - Talent user trying to access hiring manager or admin route')
          return NextResponse.redirect(new URL('/talent/dashboard', req.url))
        }
      } else if (user.role === 'hiring_manager') {
        // If hiring manager is trying to access the dashboard root, redirect to hiring manager dashboard
        if (pathname === '/dashboard') {
          console.log('Middleware - Redirecting hiring manager to hiring manager dashboard')
          return NextResponse.redirect(new URL('/hiring-manager/dashboard', req.url))
        }
        
        if (talentRoutes.some(route => pathname.startsWith(route)) || 
            adminRoutes.some(route => pathname.startsWith(route))) {
          console.log('Middleware - Hiring manager trying to access talent or admin route')
          return NextResponse.redirect(new URL('/hiring-manager/dashboard', req.url))
        }
      } else if (user.role === 'admin') {
        // If admin is trying to access the dashboard root, redirect to admin dashboard
        if (pathname === '/dashboard') {
          console.log('Middleware - Redirecting admin to admin dashboard')
          return NextResponse.redirect(new URL('/admin/dashboard', req.url))
        }
        
        // Admin can access all routes, but we'll still redirect if they try to access specific role dashboards
        if ((talentRoutes.some(route => pathname.startsWith(route)) && !pathname.includes('/admin')) || 
            (hiringManagerRoutes.some(route => pathname.startsWith(route)) && !pathname.includes('/admin'))) {
          console.log('Middleware - Admin trying to access specific role dashboard')
          return NextResponse.redirect(new URL('/admin/dashboard', req.url))
        }
      } else {
        // Unknown role
        console.log('Middleware - Unknown role')
        return NextResponse.redirect(new URL('/role-selection', req.url))
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
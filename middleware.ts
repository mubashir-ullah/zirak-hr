import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

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

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const { pathname } = req.nextUrl
    
    console.log('Middleware - Path:', pathname)
    console.log('Middleware - Token:', token ? JSON.stringify(token) : 'No token')
    
    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
      // If user is not authenticated, redirect to login
      if (!token) {
        console.log('Middleware - No token, redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      // Check if user needs to select a role
      if (token.needsRoleSelection === true && pathname !== '/dashboard/role-selection') {
        console.log('Middleware - User needs role selection, redirecting')
        return NextResponse.redirect(new URL('/dashboard/role-selection', req.url))
      }
      
      // Allow access to role selection page
      if (pathname === '/dashboard/role-selection') {
        console.log('Middleware - Allowing access to role selection page')
        return NextResponse.next()
      }
      
      // Redirect based on user role for the main dashboard route
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        if (token.role === 'talent') {
          console.log('Middleware - Redirecting talent to talent dashboard')
          return NextResponse.redirect(new URL('/dashboard/talent', req.url))
        } else if (token.role === 'hiring_manager') {
          console.log('Middleware - Redirecting hiring manager to hiring manager dashboard')
          return NextResponse.redirect(new URL('/dashboard/hiring-manager', req.url))
        } else {
          console.log('Middleware - No role defined, redirecting to role selection')
          return NextResponse.redirect(new URL('/dashboard/role-selection', req.url))
        }
      }
      
      // Role-based route protection
      const userRole = token.role as string
      console.log('Middleware - User role:', userRole)
      
      // Prevent talent from accessing hiring manager routes
      if (userRole === 'talent') {
        const isHiringManagerRoute = hiringManagerRoutes.some(route => 
          pathname === route || pathname.startsWith(`${route}/`)
        )
        
        if (isHiringManagerRoute) {
          console.log('Middleware - Talent trying to access hiring manager route, redirecting')
          return NextResponse.redirect(new URL('/dashboard/talent', req.url))
        }
      }
      
      // Prevent hiring manager from accessing talent routes
      if (userRole === 'hiring_manager') {
        const isTalentRoute = talentRoutes.some(route => 
          pathname === route || pathname.startsWith(`${route}/`)
        )
        
        if (isTalentRoute) {
          console.log('Middleware - Hiring manager trying to access talent route, redirecting')
          return NextResponse.redirect(new URL('/dashboard/hiring-manager', req.url))
        }
      }
    }
    
    console.log('Middleware - Allowing access to:', pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Middleware - Authorized callback, token exists:', !!token)
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/auth/:path*',
    '/api/talent/:path*',
    '/api/hiring-manager/:path*',
  ],
}
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Protect dashboard routes
    if (path.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Redirect based on role
      if (path.startsWith('/dashboard/hiring-manager') && token.role !== 'hiring_manager') {
        return NextResponse.redirect(new URL('/dashboard/talent', req.url))
      }

      if (path.startsWith('/dashboard/talent') && token.role !== 'talent') {
        return NextResponse.redirect(new URL('/dashboard/hiring-manager', req.url))
      }
    }

    // Protect API routes
    if (path.startsWith('/api')) {
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
} 
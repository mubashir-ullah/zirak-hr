import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    _id: string
    name: string
    email: string
    role: 'talent' | 'hiring_manager'
    organization?: string
    position?: string
  }

  interface Session {
    user: User & {
      id: string
      role: 'talent' | 'hiring_manager'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'talent' | 'hiring_manager'
    id: string
  }
} 
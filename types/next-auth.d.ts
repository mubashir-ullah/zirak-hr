import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'talent' | 'hiring_manager'
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'talent' | 'hiring_manager'
    email: string
    name: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'talent' | 'hiring_manager'
    id: string
  }
} 
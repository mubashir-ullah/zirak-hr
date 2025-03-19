import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

type Role = 'talent' | 'hiring_manager';

interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: Role;
}

const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'talent@zirak.com',
    name: 'Talent User',
    password: 'talent123',
    role: 'talent'
  },
  {
    id: '2',
    email: 'hiring@zirak.com',
    name: 'Hiring Manager',
    password: 'hiring123',
    role: 'hiring_manager'
  }
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter your email and password');
          }

          const email = credentials.email.toLowerCase().trim();
          const user = mockUsers.find(u => u.email === email);

          if (!user) {
            throw new Error('No user found with this email');
          }

          if (user.password !== credentials.password) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
});

export { handler as GET, handler as POST };
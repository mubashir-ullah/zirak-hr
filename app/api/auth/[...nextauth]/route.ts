import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import LinkedInProvider from 'next-auth/providers/linkedin'
import AppleProvider from 'next-auth/providers/apple'
import clientPromise from '@/lib/mongodb'
import { User } from '@/models/User'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'

// Define types for our application
type Role = 'talent' | 'hiring_manager';

interface MockUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: Role;
  image?: string;
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

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      },
      profile(profile) {
        console.log('GitHub profile data:', profile);
        // Return only the standard fields that NextAuth expects
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        } as any; // Use type assertion to satisfy TypeScript
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      authorization: {
        params: { 
          scope: 'r_emailaddress r_liteprofile',
          state: Math.random().toString(36).substring(7)
        }
      },
      token: {
        url: 'https://www.linkedin.com/oauth/v2/accessToken',
        async request(context) {
          try {
            const { params, provider } = context;
            const tokenUrl = typeof provider.token === 'string' 
              ? provider.token 
              : 'https://www.linkedin.com/oauth/v2/accessToken';
              
            const response = await fetch(tokenUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: params.code || '',
                redirect_uri: provider.callbackUrl || '',
                client_id: provider.clientId || '',
                client_secret: provider.clientSecret || '',
              } as Record<string, string>),
            });
            
            const tokens = await response.json();
            console.log('LinkedIn token response:', tokens);
            return { tokens };
          } catch (error) {
            console.error('LinkedIn token request error:', error);
            throw error;
          }
        },
      },
      userinfo: {
        url: 'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
        async request(context) {
          try {
            const { tokens } = context;
            
            if (!tokens.access_token) {
              throw new Error('No access token available');
            }
            
            // Get basic profile info
            const profileRes = await fetch(
              'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                },
              }
            );
            
            if (!profileRes.ok) {
              throw new Error(`LinkedIn profile request failed: ${profileRes.status}`);
            }
            
            const profile = await profileRes.json();
            console.log('LinkedIn profile response:', profile);
            
            // Get email address
            const emailRes = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            });
            
            if (!emailRes.ok) {
              console.warn(`LinkedIn email request failed: ${emailRes.status}`);
            }
            
            let email = '';
            try {
              const emailData = await emailRes.json();
              console.log('LinkedIn email response:', emailData);
              email = emailData?.elements?.[0]?.['handle~']?.emailAddress || '';
            } catch (error) {
              console.error('Error parsing LinkedIn email response:', error);
            }
            
            return {
              id: profile.id,
              name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
              email: email,
              image: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier || null,
            };
          } catch (error) {
            console.error('LinkedIn userinfo request error:', error);
            throw error;
          }
        },
      },
      profile(profile) {
        console.log('LinkedIn profile data:', profile);
        // Return only the standard fields that NextAuth expects
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image,
        } as any; // Use type assertion to satisfy TypeScript
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_SECRET || '',
    }),
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

          // For development, we'll use mock data
          // In production, you should use the database
          const email = credentials.email.toLowerCase().trim();
          
          // Try to connect to MongoDB first
          let user;
          try {
            const client = await clientPromise;
            if (client) {
              const db = client.db('zirakhr');
              user = await User.findByEmail(db, email);
              
              if (user) {
                // Verify password
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                  throw new Error('Invalid password');
                }
                
                return {
                  id: user._id?.toString() || '',
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  image: null,
                };
              }
            }
          } catch (error) {
            console.error('Database error in authorize:', error);
            // Fall back to mock users if database connection fails
          }
          
          // If no user found in database or if database connection failed, try mock users
          const mockUser = mockUsers.find(u => u.email === email);
          if (!mockUser || !mockUser.password) {
            throw new Error('No user found with this email');
          }

          if (mockUser.password !== credentials.password) {
            throw new Error('Invalid password');
          }

          return {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            image: mockUser.image,
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT Callback - Token before:', JSON.stringify(token));
      console.log('JWT Callback - User:', user ? JSON.stringify(user) : 'No user');
      
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.needsRoleSelection = (user as any).needsRoleSelection || false;
      }
      if (account) {
        token.provider = account.provider;
      }
      
      console.log('JWT Callback - Token after:', JSON.stringify(token));
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Token:', JSON.stringify(token));
      
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).provider = token.provider;
        (session.user as any).needsRoleSelection = token.needsRoleSelection || false;
      }
      
      console.log('Session Callback - Session:', JSON.stringify(session));
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback - Provider:', account?.provider);
      console.log('SignIn Callback - User:', JSON.stringify(user));
      
      if (account?.provider === 'credentials') {
        return true;
      }
      
      // For social logins, create or update user in your database
      const email = user.email?.toLowerCase();
      if (!email) {
        return false;
      }

      try {
        // Try to connect to MongoDB first
        try {
          const client = await clientPromise;
          if (client) {
            const db = client.db('zirakhr');
            
            // Check if user exists in database
            let dbUser = await User.findByEmail(db, email);
            
            if (dbUser) {
              // Update existing user with latest profile info
              user.id = dbUser._id?.toString() || user.id;
              (user as any).role = dbUser.role;
            } else {
              // For new social login users, we'll set needsRoleSelection flag
              // and redirect them to role selection page via middleware
              (user as any).needsRoleSelection = true;
              
              // Generate a random password for social login users
              const randomPassword = Math.random().toString(36).slice(2, 10);
              const hashedPassword = await bcrypt.hash(randomPassword, 10);
              
              // Create a new user in the database with temporary role
              // The actual role will be set when they complete the role selection
              const newUser = await User.create(db, {
                name: user.name || email.split('@')[0],
                email: email,
                password: hashedPassword,
                role: 'talent', // Default role, will be updated after selection
                socialProvider: account?.provider
              });
              
              console.log('Created new social login user:', newUser._id);
              user.id = newUser._id?.toString() || user.id;
              (user as any).role = 'talent'; // Temporary role
            }
            
            return true;
          }
        } catch (error) {
          console.error('Database error in signIn:', error);
          // Fall back to mock data if database connection fails
        }
        
        // For development purposes, we'll use mock data instead of MongoDB
        // to avoid connection errors when MongoDB isn't set up
        
        // Check if user exists in mock data
        const existingMockUser = mockUsers.find(u => u.email === email);
        
        if (existingMockUser) {
          // Update existing user with latest profile info
          user.id = existingMockUser.id;
          (user as any).role = existingMockUser.role;
        } else {
          // For new social login users, we'll set needsRoleSelection flag
          // and redirect them to role selection page via middleware
          (user as any).needsRoleSelection = true;
          
          // Create a new mock user with temporary role
          const newId = (mockUsers.length + 1).toString();
          const newMockUser: MockUser = {
            id: newId,
            name: user.name || email.split('@')[0],
            email: email,
            role: 'talent', // Default role, will be updated after selection
          };
          
          mockUsers.push(newMockUser);
          
          console.log('Created new social login user:', newId);
          user.id = newId;
          (user as any).role = 'talent'; // Temporary role
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect Callback - URL:', url);
      console.log('Redirect Callback - BaseURL:', baseUrl);
      
      // Handle custom redirects based on user type
      if (url.startsWith(baseUrl)) {
        // After sign in, redirect to dashboard
        if (url.includes('/api/auth/signin') || url.includes('/api/auth/callback')) {
          const redirectUrl = `${baseUrl}/dashboard`; // Let middleware handle specific dashboard routing
          console.log('Redirecting to:', redirectUrl);
          return redirectUrl;
        }
      }
      
      console.log('Final redirect URL:', url);
      return url;
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
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
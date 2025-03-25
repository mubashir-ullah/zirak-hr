import { NextRequest, NextResponse } from 'next/server';
import { handleAuthCallback } from '@/lib/supabaseAuth';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Extract the code and state from the URL
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (code) {
      // Exchange the code for a session
      const cookieStore = cookies();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      // Create a temporary supabase client with the cookies
      const supabaseServer = supabase;
      
      // Exchange the code for a session
      await supabaseServer.auth.exchangeCodeForSession(code);
      
      // Handle the callback in our custom auth handler
      const { user, error } = await handleAuthCallback();
      
      if (error || !user) {
        console.error('Error in auth callback:', error);
        return NextResponse.redirect(new URL('/login?error=AuthCallbackError', request.url));
      }
      
      // Redirect based on whether the user needs to select a role
      if (user.needs_role_selection) {
        return NextResponse.redirect(new URL('/dashboard/role-selection', request.url));
      } else {
        // Redirect to the appropriate dashboard based on role
        switch (user.role) {
          case 'talent':
            return NextResponse.redirect(new URL('/dashboard/talent', request.url));
          case 'hiring_manager':
            return NextResponse.redirect(new URL('/dashboard/hr', request.url));
          case 'admin':
            return NextResponse.redirect(new URL('/dashboard/admin', request.url));
          default:
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
    
    // If no code is present, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Error in auth callback route:', error);
    return NextResponse.redirect(new URL('/login?error=AuthCallbackError', request.url));
  }
}

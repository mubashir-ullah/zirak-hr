import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '@/lib/supabase';
import { findUserByEmail } from '@/lib/supabaseDb';

export async function GET(request: NextRequest) {
  try {
    // Extract the code and state from the URL
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    
    // Handle authentication errors from OAuth providers
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }
    
    if (code) {
      try {
        // Exchange the code for a session
        const cookieStore = cookies();
        
        // Create a temporary supabase client with the cookies
        const supabaseServer = supabase;
        
        // Exchange the code for a session
        const { data, error: exchangeError } = await supabaseServer.auth.exchangeCodeForSession(code);
        
        if (exchangeError || !data.session || !data.user) {
          console.error('Error exchanging code for session:', exchangeError);
          return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(exchangeError?.message || 'Failed to authenticate')}`, request.url)
          );
        }
        
        // Check if user exists in our database
        const user = await findUserByEmail(data.user.email || '');
        
        if (!user) {
          // Create user in our database
          try {
            const createUserResponse = await fetch(`${requestUrl.origin}/api/auth/create-user`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
                social_provider: data.user.app_metadata?.provider || 'unknown',
              }),
            });
            
            if (!createUserResponse.ok) {
              console.error('Error creating user record:', await createUserResponse.text());
            }
          } catch (createError) {
            console.error('Error creating user record:', createError);
          }
          
          // User doesn't exist in our database yet, redirect to role selection
          return NextResponse.redirect(
            new URL(`/dashboard/role-selection?email=${encodeURIComponent(data.user.email || '')}`, request.url)
          );
        }
        
        // Check if email verification is needed
        if (!user.email_verified) {
          return NextResponse.redirect(
            new URL(`/verify-email?email=${encodeURIComponent(user.email)}`, request.url)
          );
        }
        
        // Check if role selection is needed
        if (!user.role || user.needs_role_selection) {
          return NextResponse.redirect(
            new URL('/dashboard/role-selection', request.url)
          );
        }
        
        // Redirect to the appropriate dashboard based on role
        switch (user.role) {
          case 'talent':
            return NextResponse.redirect(new URL('/dashboard/talent', request.url));
          case 'hiring_manager':
            return NextResponse.redirect(new URL('/dashboard/hiring-manager', request.url));
          case 'admin':
            return NextResponse.redirect(new URL('/dashboard/admin', request.url));
          default:
            // Unknown role, redirect to role selection
            return NextResponse.redirect(new URL('/dashboard/role-selection', request.url));
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('An unexpected error occurred')}`, request.url)
        );
      }
    }
    
    // If no code is present, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('An unexpected error occurred')}`, request.url)
    );
  }
}

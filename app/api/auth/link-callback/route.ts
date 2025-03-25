import { NextRequest, NextResponse } from 'next/server';
import { handleLinkCallback } from '@/lib/supabaseAuth';
import supabase from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Extract the code and state from the URL
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    
    // Handle authentication errors from OAuth providers
    if (error) {
      console.error('OAuth error during account linking:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }
    
    if (code) {
      try {
        // Exchange the code for a session
        await supabase.auth.exchangeCodeForSession(code);
        
        // Handle the callback in our custom auth handler
        const { success, error } = await handleLinkCallback();
        
        if (!success) {
          console.error('Error in link callback:', error);
          return NextResponse.redirect(
            new URL(`/dashboard/settings?error=${encodeURIComponent(error || 'Failed to link account')}`, request.url)
          );
        }
        
        // Redirect to settings page with success message
        return NextResponse.redirect(
          new URL('/dashboard/settings?success=Account linked successfully', request.url)
        );
      } catch (exchangeError) {
        console.error('Error exchanging code for session during account linking:', exchangeError);
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=Failed to complete account linking', request.url)
        );
      }
    }
    
    // If no code is present, redirect to settings page with error
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=Missing authentication code', request.url)
    );
  } catch (error) {
    console.error('Unexpected error in link callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=An unexpected error occurred', request.url)
    );
  }
}

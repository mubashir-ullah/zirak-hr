import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserById, updateUser } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Extract the code and state from the URL
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    const userId = requestUrl.searchParams.get('user_id');
    
    // Handle authentication errors from OAuth providers
    if (error) {
      console.error('OAuth error during account linking:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }
    
    if (!code) {
      // If no code is present, redirect to settings page with error
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=Missing authentication code', request.url)
      );
    }
    
    try {
      // Exchange the code for a session
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError || !sessionData.session) {
        console.error('Error exchanging code for session during account linking:', exchangeError);
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=Failed to complete account linking', request.url)
        );
      }
      
      // Get the current user's session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession || !currentSession.user) {
        console.error('No active session found during account linking');
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=No active session found', request.url)
        );
      }
      
      // Verify that the user_id parameter matches the current user's ID
      if (userId && userId !== currentSession.user.id) {
        console.error('User ID mismatch during account linking');
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=Security verification failed', request.url)
        );
      }
      
      // Get the user's identities from Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        currentSession.user.id
      );
      
      if (userError || !userData) {
        console.error('Error getting user data:', userError);
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=Failed to retrieve user data', request.url)
        );
      }
      
      // Update user in our database to indicate account linking
      const user = await findUserById(currentSession.user.id);
      
      if (user) {
        // Update the user record with linked account information
        await updateUser(user.id, {
          has_linked_accounts: true,
          updated_at: new Date().toISOString()
        });
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
  } catch (error) {
    console.error('Unexpected error in link callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=An unexpected error occurred', request.url)
    );
  }
}

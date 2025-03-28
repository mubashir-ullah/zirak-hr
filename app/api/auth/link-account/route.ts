import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserById, updateUser } from '@/lib/database';

/**
 * Generate an OAuth URL for linking a social provider to an existing account
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session || !sessionData.session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the provider to link from the request body
    const { provider } = await req.json();
    
    if (!provider || !['google', 'github', 'linkedin', 'apple'].includes(provider)) {
      return NextResponse.json({ message: 'Valid provider is required' }, { status: 400 });
    }
    
    // Verify that the user exists in our database
    const user = await findUserById(sessionData.session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Generate the OAuth URL with the current session
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/link-callback`,
        scopes: provider === 'github' ? 'user:email' : undefined,
        queryParams: {
          // Add a parameter to indicate this is a linking flow
          link_account: 'true',
          // Include the current user ID to verify on callback
          user_id: sessionData.session.user.id
        }
      }
    });
    
    if (error || !data.url) {
      console.error('Error generating link URL:', error);
      return NextResponse.json({ message: error?.message || 'Failed to generate link URL' }, { status: 500 });
    }
    
    // Return the URL for the client to redirect to
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Error in link-account route:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * Get the linked accounts for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session || !sessionData.session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's identities from Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      sessionData.session.user.id
    );
    
    if (userError || !userData) {
      console.error('Error getting user data:', userError);
      return NextResponse.json({ message: 'Failed to retrieve user data' }, { status: 500 });
    }
    
    // Extract the identities (linked accounts)
    const identities = userData.user.identities || [];
    
    // Format the response
    const linkedAccounts = identities.map(identity => ({
      id: identity.id,
      provider: identity.provider,
      linked_at: identity.created_at,
      email: identity.identity_data?.email || null
    }));
    
    return NextResponse.json({ linkedAccounts });
  } catch (error) {
    console.error('Error getting linked accounts:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

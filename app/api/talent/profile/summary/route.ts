import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { findUserById } from '@/lib/supabaseDb'
import { findUserByEmail } from '@/lib/database'
import supabase from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('Profile summary API called');
    
    // Create a Supabase client
    const supabase = createServerComponentClient({ cookies })
    
    // Get the user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session || !session.user) {
      console.log('No session found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log(`Session found for user: ${session.user.id}`);
    console.log(`User email: ${session.user.email}`);
    
    // Try to find the user profile using Supabase - first try by ID
    let userProfile = await findUserById(session.user.id);
    
    // If not found by ID, try by email
    if (!userProfile && session.user.email) {
      console.log('User not found by ID, trying by email');
      userProfile = await findUserByEmail(session.user.email);
    }
    
    // If still not found, try to get basic info from the session
    if (!userProfile) {
      console.log('User not found in database, using session data');
      
      // Create a minimal profile from the session data
      const profileSummary = {
        fullName: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
        title: session.user.user_metadata?.position || 'Talent',
        profilePicture: session.user.user_metadata?.avatar_url || '/images/default-avatar.png'
      }
      
      console.log('Returning minimal profile from session:', profileSummary);
      
      return NextResponse.json(
        { profile: profileSummary },
        { status: 200 }
      )
    }
    
    console.log('User profile found:', userProfile.id);
    
    // Extract only the needed fields for the summary
    // Handle avatar_url which might not be in the UserData type
    const profilePicture = 
      (userProfile as any).avatar_url || 
      userProfile.resume_url || 
      '/images/default-avatar.png';
      
    const profileSummary = {
      fullName: userProfile.name || '',
      title: userProfile.position || '',
      profilePicture: profilePicture
    }
    
    console.log('Returning profile summary:', profileSummary);
    
    return NextResponse.json(
      { profile: profileSummary },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error fetching profile summary:', error);
    
    // Return a default profile to prevent the UI from breaking
    const defaultProfile = {
      fullName: 'User',
      title: 'Talent',
      profilePicture: '/images/default-avatar.png'
    };
    
    return NextResponse.json(
      { 
        profile: defaultProfile,
        error: 'Failed to fetch profile summary, using default profile'
      },
      { status: 200 } // Return 200 with default data instead of 500 to prevent UI from breaking
    )
  }
}

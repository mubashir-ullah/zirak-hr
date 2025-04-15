import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserById } from '@/lib/supabaseDb';

export async function GET(request: NextRequest) {
  try {
    console.log('Auth check API called');
    
    // Get the current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      return NextResponse.json(
        { error: 'Authentication failed', authenticated: false, details: error.message },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      console.log('Auth check: No session found');
      return NextResponse.json(
        { error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }

    console.log('Auth check: Session found for user', session.user.id);

    // Find user in our database
    const user = await findUserById(session.user.id);

    if (!user) {
      console.error('Auth check: User not found in database for ID', session.user.id);
      return NextResponse.json(
        { error: 'User not found in database', authenticated: false, userId: session.user.id },
        { status: 401 }
      );
    }

    console.log('Auth check: User found in database', {
      id: user.id,
      email: user.email,
      role: user.role,
      needs_role_selection: user.needs_role_selection
    });

    // Return user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        needs_role_selection: user.needs_role_selection,
        needs_profile_completion: user.needs_profile_completion,
        email_verified: user.email_verified,
        resume_url: user.resume_url,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', authenticated: false, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 401 }
    );
  }
}

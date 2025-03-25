import { NextRequest, NextResponse } from 'next/server'
import { linkSocialProvider } from '@/lib/supabaseAuth'
import supabase from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !sessionData.session || !sessionData.session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the provider to link from the request body
    const { provider } = await req.json()
    
    if (!provider) {
      return NextResponse.json({ message: 'Provider is required' }, { status: 400 })
    }
    
    // Use the linkSocialProvider function to generate the OAuth URL
    const { url, error } = await linkSocialProvider(provider)
    
    if (error || !url) {
      return NextResponse.json({ message: error || 'Failed to generate link URL' }, { status: 500 })
    }
    
    // Return the URL for the client to redirect to
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error in link-account route:', error)
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 })
  }
}

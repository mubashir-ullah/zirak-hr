import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { updateUser, findUserById } from '@/lib/supabaseDb';

// GET endpoint to retrieve hiring manager profile
export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a hiring manager
    const user = await findUserById(session.user.id);
    
    if (!user || user.role !== 'hiring_manager') {
      return NextResponse.json({ error: 'Unauthorized. Only hiring managers can access this endpoint' }, { status: 403 });
    }

    // Retrieve profile data from Supabase
    const { data: hiringProfile, error } = await supabase
      .from('hiring_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error fetching hiring profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
    
    // If no profile exists yet, return empty profile structure
    if (!hiringProfile) {
      return NextResponse.json({ 
        profile: {
          userId: session.user.id,
          fullName: user.name || '',
          email: user.email || '',
          company: user.organization || '',
          position: user.position || '',
          companyDescription: '',
          companySize: '',
          industry: '',
          companyWebsite: '',
          companyLogo: '',
          companyLocation: '',
          hiringNeeds: '',
          contactPhone: '',
          linkedinUrl: ''
        }
      });
    }

    // Return the profile with camelCase keys for frontend compatibility
    return NextResponse.json({ 
      profile: {
        ...hiringProfile,
        userId: hiringProfile.user_id,
        fullName: hiringProfile.full_name,
        companyDescription: hiringProfile.company_description,
        companySize: hiringProfile.company_size,
        companyWebsite: hiringProfile.company_website,
        companyLogo: hiringProfile.company_logo,
        companyLocation: hiringProfile.company_location,
        hiringNeeds: hiringProfile.hiring_needs,
        contactPhone: hiringProfile.contact_phone,
        linkedinUrl: hiringProfile.linkedin_url
      }
    });
  } catch (error) {
    console.error('Error retrieving hiring profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
}

// POST endpoint to create or update hiring profile
export async function POST(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a hiring manager
    const user = await findUserById(session.user.id);
    
    if (!user || user.role !== 'hiring_manager') {
      return NextResponse.json({ error: 'Unauthorized. Only hiring managers can access this endpoint' }, { status: 403 });
    }
    
    // Get profile data from request
    const profileData = await request.json();
    
    // Convert camelCase to snake_case for Supabase
    const supabaseProfileData = {
      user_id: session.user.id,
      full_name: profileData.fullName,
      email: profileData.email,
      company: profileData.company,
      position: profileData.position,
      company_description: profileData.companyDescription,
      company_size: profileData.companySize,
      industry: profileData.industry,
      company_website: profileData.companyWebsite,
      company_logo: profileData.companyLogo,
      company_location: profileData.companyLocation,
      hiring_needs: profileData.hiringNeeds,
      contact_phone: profileData.contactPhone,
      linkedin_url: profileData.linkedinUrl
    };
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('hiring_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    let result;
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('hiring_profiles')
        .update(supabaseProfileData)
        .eq('user_id', session.user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating hiring profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
      
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('hiring_profiles')
        .insert(supabaseProfileData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating hiring profile:', error);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
      
      result = data;
    }
    
    // Update user record with company and position
    await updateUser(session.user.id, { 
      organization: profileData.company,
      position: profileData.position
    });
    
    // Return the updated profile
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: {
        ...result,
        userId: result.user_id,
        fullName: result.full_name,
        companyDescription: result.company_description,
        companySize: result.company_size,
        companyWebsite: result.company_website,
        companyLogo: result.company_logo,
        companyLocation: result.company_location,
        hiringNeeds: result.hiring_needs,
        contactPhone: result.contact_phone,
        linkedinUrl: result.linkedin_url
      }
    });
  } catch (error) {
    console.error('Error updating hiring profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { updateUser, findUserById } from '@/lib/supabaseDb';

// GET endpoint to retrieve talent profile
export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve profile data from Supabase
    const { data: talentProfile, error } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error fetching talent profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
    
    // Get basic user data
    const user = await findUserById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // If no profile exists yet, return empty profile structure
    if (!talentProfile) {
      return NextResponse.json({ 
        profile: {
          userId: session.user.id,
          fullName: user.name || '',
          email: user.email || '',
          skills: [],
          experience: '',
          country: '',
          city: '',
          germanLevel: '',
          availability: '',
          visaRequired: false,
          visaType: '',
          linkedinUrl: '',
          githubUrl: '',
          bio: '',
          profilePicture: '',
          resumeUrl: user.resume_url || '',
          title: '',
          phone: '',
          education: [],
          preferredJobTypes: [],
          preferredLocations: [],
          languages: []
        }
      });
    }

    // Return the profile with camelCase keys for frontend compatibility
    return NextResponse.json({ 
      profile: {
        ...talentProfile,
        userId: talentProfile.user_id,
        fullName: talentProfile.full_name,
        visaRequired: talentProfile.visa_required,
        visaType: talentProfile.visa_type,
        linkedinUrl: talentProfile.linkedin_url,
        githubUrl: talentProfile.github_url,
        profilePicture: talentProfile.profile_picture,
        resumeUrl: talentProfile.resume_url,
        preferredJobTypes: talentProfile.preferred_job_types,
        preferredLocations: talentProfile.preferred_locations,
        germanLevel: talentProfile.german_level
      }
    });
  } catch (error) {
    console.error('Error retrieving talent profile:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
}

// POST endpoint to create or update talent profile
export async function POST(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get profile data from request
    const profileData = await request.json();
    
    // Convert camelCase to snake_case for Supabase
    const supabaseProfileData = {
      user_id: session.user.id,
      full_name: profileData.fullName,
      email: profileData.email,
      skills: profileData.skills || [],
      experience: profileData.experience,
      country: profileData.country,
      city: profileData.city,
      german_level: profileData.germanLevel,
      availability: profileData.availability,
      visa_required: profileData.visaRequired,
      visa_type: profileData.visaType,
      linkedin_url: profileData.linkedinUrl,
      github_url: profileData.githubUrl,
      bio: profileData.bio,
      profile_picture: profileData.profilePicture,
      resume_url: profileData.resumeUrl,
      title: profileData.title,
      phone: profileData.phone,
      education: profileData.education || [],
      preferred_job_types: profileData.preferredJobTypes || [],
      preferred_locations: profileData.preferredLocations || [],
      languages: profileData.languages || []
    };
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    let result;
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('talent_profiles')
        .update(supabaseProfileData)
        .eq('user_id', session.user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating talent profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
      
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('talent_profiles')
        .insert(supabaseProfileData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating talent profile:', error);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
      
      result = data;
    }
    
    // Update resume_url in user record if it's provided
    if (profileData.resumeUrl) {
      await updateUser(session.user.id, { resume_url: profileData.resumeUrl });
    }
    
    // Return the updated profile
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: {
        ...result,
        userId: result.user_id,
        fullName: result.full_name,
        visaRequired: result.visa_required,
        visaType: result.visa_type,
        linkedinUrl: result.linkedin_url,
        githubUrl: result.github_url,
        profilePicture: result.profile_picture,
        resumeUrl: result.resume_url,
        preferredJobTypes: result.preferred_job_types,
        preferredLocations: result.preferred_locations,
        germanLevel: result.german_level
      }
    });
  } catch (error) {
    console.error('Error updating talent profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

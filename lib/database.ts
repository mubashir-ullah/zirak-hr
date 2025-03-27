import supabase from './supabase';
import { findUserById } from './supabaseDb';

// Talent Profile Types
export interface TalentProfile {
  id?: string;
  user_id: string;
  bio?: string;
  phone?: string;
  country?: string;
  city?: string;
  german_level?: string;
  availability?: string;
  visa_required?: boolean;
  visa_type?: string;
  linkedin_url?: string;
  github_url?: string;
  profile_picture?: string;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id?: string;
  user_id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience: number;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Education {
  id?: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Experience {
  id?: string;
  user_id: string;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Language {
  id?: string;
  user_id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'native';
  created_at?: string;
  updated_at?: string;
}

// Get talent profile by user ID
export const getTalentProfileByUserId = async (userId: string): Promise<TalentProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching talent profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getTalentProfileByUserId:', error);
    return null;
  }
};

// Get talent profile with all related data
export const getTalentProfileWithRelations = async (userId: string) => {
  try {
    // Get user data
    const user = await findUserById(userId);
    if (!user) return null;

    // Get talent profile
    const profile = await getTalentProfileByUserId(userId);

    // Get skills
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId);

    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
    }

    // Get education
    const { data: education, error: educationError } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', userId);

    if (educationError) {
      console.error('Error fetching education:', educationError);
    }

    // Get experience
    const { data: experience, error: experienceError } = await supabase
      .from('experience')
      .select('*')
      .eq('user_id', userId);

    if (experienceError) {
      console.error('Error fetching experience:', experienceError);
    }

    // Get languages
    const { data: languages, error: languagesError } = await supabase
      .from('languages')
      .select('*')
      .eq('user_id', userId);

    if (languagesError) {
      console.error('Error fetching languages:', languagesError);
    }

    // Format the response to match the expected structure
    return {
      userId: userId,
      fullName: user.name || '',
      email: user.email || '',
      title: user.position || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      country: profile?.country || '',
      city: profile?.city || '',
      germanLevel: profile?.german_level || '',
      availability: profile?.availability || '',
      visaRequired: profile?.visa_required || false,
      visaType: profile?.visa_type || '',
      linkedinUrl: profile?.linkedin_url || '',
      githubUrl: profile?.github_url || '',
      profilePicture: profile?.profile_picture || '',
      preferredJobTypes: profile?.preferred_job_types || [],
      preferredLocations: profile?.preferred_locations || [],
      skills: skills || [],
      education: education || [],
      experience: experience || [],
      languages: languages || []
    };
  } catch (error) {
    console.error('Exception in getTalentProfileWithRelations:', error);
    return null;
  }
};

// Find user by email
export const findUserByEmail = async (email: string): Promise<any | null> => {
  if (!email) {
    console.error('Error finding user by email: No email provided');
    return null;
  }

  try {
    console.log(`Attempting to find user with email: ${email}`);
    
    // First try to find the user in the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      console.error('Error finding user by email in users table:', error);
      
      // Try to find the user in Supabase Auth as a fallback
      console.log('Attempting to find user in Supabase Auth');
      
      // Use the auth.signInWithOtp to check if the user exists
      // This won't actually send an OTP if shouldCreateUser is false
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          shouldCreateUser: false
        }
      });
      
      if (authError && authError.status !== 400) {
        // 400 means user not found, any other error is unexpected
        console.error('Error checking user in Supabase Auth:', authError);
        return null;
      }
      
      // If we don't get an error or get a 400 error, the user might exist
      // Let's try to get the user from the auth session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user) {
        const authUser = sessionData.session.user;
        console.log(`User found in Supabase Auth session: ${authUser.id}`);
        
        // Create a minimal user object from the Auth user
        return {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || 'User',
          role: authUser.user_metadata?.role || 'talent',
          email_verified: authUser.email_confirmed_at ? true : false,
          needs_role_selection: authUser.user_metadata?.needs_role_selection !== false,
          needs_profile_completion: authUser.user_metadata?.needs_profile_completion !== false
        };
      }
      
      console.error('User not found in Supabase Auth');
      return null;
    }

    console.log(`User found in users table: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Exception in findUserByEmail:', error);
    return null;
  }
};

// Update user data
export const updateUser = async (userId: string, userData: any): Promise<any | null> => {
  if (!userId) {
    console.error('Error updating user: No user ID provided');
    return null;
  }

  try {
    console.log(`Attempting to update user with ID: ${userId}`);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    console.log(`User updated successfully: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Exception in updateUser:', error);
    return null;
  }
};

// Create or update talent profile
export const upsertTalentProfile = async (profileData: TalentProfile): Promise<TalentProfile | null> => {
  try {
    // Check if profile exists
    const existingProfile = await getTalentProfileByUserId(profileData.user_id);
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('talent_profiles')
        .update({
          bio: profileData.bio,
          phone: profileData.phone,
          country: profileData.country,
          city: profileData.city,
          german_level: profileData.german_level,
          availability: profileData.availability,
          visa_required: profileData.visa_required,
          visa_type: profileData.visa_type,
          linkedin_url: profileData.linkedin_url,
          github_url: profileData.github_url,
          profile_picture: profileData.profile_picture,
          preferred_job_types: profileData.preferred_job_types,
          preferred_locations: profileData.preferred_locations,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profileData.user_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating talent profile:', error);
        return null;
      }

      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('talent_profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating talent profile:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Exception in upsertTalentProfile:', error);
    return null;
  }
};

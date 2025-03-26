/**
 * Talent profile database operations for Zirak HR
 * 
 * This file contains functions for interacting with talent profile-related tables
 * in the Supabase database.
 */

import supabase from '../supabase';
import { 
  TalentProfile, 
  TalentSkill, 
  TalentEducation, 
  TalentExperience,
  TalentLanguage,
  TalentPreference,
  Skill
} from './types';

/**
 * Create or update a talent profile
 * @param userId User ID to create/update profile for
 * @param profileData Profile data to create/update
 * @returns The created/updated profile or null if an error occurred
 */
export async function upsertTalentProfile(
  userId: string, 
  profileData: Partial<Omit<TalentProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<TalentProfile | null> {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('talent_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
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
          user_id: userId,
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
}

/**
 * Get a talent profile by user ID
 * @param userId User ID to get profile for
 * @returns The profile or null if not found
 */
export async function getTalentProfileByUserId(userId: string): Promise<TalentProfile | null> {
  try {
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting talent profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getTalentProfileByUserId:', error);
    return null;
  }
}

/**
 * Get a talent profile with all related data
 * @param userId User ID to get profile for
 * @returns The profile with related data or null if not found
 */
export async function getTalentProfileWithRelations(userId: string): Promise<{
  profile: TalentProfile | null;
  skills: (TalentSkill & { skill: Skill })[] | null;
  education: TalentEducation[] | null;
  experience: TalentExperience[] | null;
  languages: TalentLanguage[] | null;
  preferences: TalentPreference | null;
}> {
  try {
    // Get the profile
    const profile = await getTalentProfileByUserId(userId);
    
    if (!profile) {
      return {
        profile: null,
        skills: null,
        education: null,
        experience: null,
        languages: null,
        preferences: null
      };
    }

    // Get skills with skill details
    const { data: skills, error: skillsError } = await supabase
      .from('talent_skills')
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('talent_id', profile.id);

    if (skillsError) {
      console.error('Error getting talent skills:', skillsError);
    }

    // Get education
    const { data: education, error: educationError } = await supabase
      .from('talent_education')
      .select('*')
      .eq('talent_id', profile.id)
      .order('start_date', { ascending: false });

    if (educationError) {
      console.error('Error getting talent education:', educationError);
    }

    // Get experience
    const { data: experience, error: experienceError } = await supabase
      .from('talent_experience')
      .select('*')
      .eq('talent_id', profile.id)
      .order('start_date', { ascending: false });

    if (experienceError) {
      console.error('Error getting talent experience:', experienceError);
    }

    // Get languages
    const { data: languages, error: languagesError } = await supabase
      .from('talent_languages')
      .select('*')
      .eq('talent_id', profile.id);

    if (languagesError) {
      console.error('Error getting talent languages:', languagesError);
    }

    // Get preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('talent_preferences')
      .select('*')
      .eq('talent_id', profile.id)
      .single();

    if (preferencesError && preferencesError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error getting talent preferences:', preferencesError);
    }

    return {
      profile,
      skills: skills || null,
      education: education || null,
      experience: experience || null,
      languages: languages || null,
      preferences: preferences || null
    };
  } catch (error) {
    console.error('Exception in getTalentProfileWithRelations:', error);
    return {
      profile: null,
      skills: null,
      education: null,
      experience: null,
      languages: null,
      preferences: null
    };
  }
}

/**
 * Add a skill to a talent profile
 * @param talentId Talent profile ID
 * @param skillId Skill ID
 * @param proficiencyLevel Proficiency level (1-5)
 * @returns The created skill or null if an error occurred
 */
export async function addTalentSkill(
  talentId: string,
  skillId: string,
  proficiencyLevel: number = 3
): Promise<TalentSkill | null> {
  try {
    // Check if skill already exists
    const { data: existingSkill } = await supabase
      .from('talent_skills')
      .select('*')
      .eq('talent_id', talentId)
      .eq('skill_id', skillId)
      .single();

    if (existingSkill) {
      // Update existing skill
      const { data, error } = await supabase
        .from('talent_skills')
        .update({
          proficiency_level: proficiencyLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSkill.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating talent skill:', error);
        return null;
      }

      return data;
    } else {
      // Create new skill
      const { data, error } = await supabase
        .from('talent_skills')
        .insert({
          talent_id: talentId,
          skill_id: skillId,
          proficiency_level: proficiencyLevel,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding talent skill:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Exception in addTalentSkill:', error);
    return null;
  }
}

/**
 * Remove a skill from a talent profile
 * @param talentId Talent profile ID
 * @param skillId Skill ID
 * @returns True if successful, false otherwise
 */
export async function removeTalentSkill(talentId: string, skillId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('talent_skills')
      .delete()
      .eq('talent_id', talentId)
      .eq('skill_id', skillId);

    if (error) {
      console.error('Error removing talent skill:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in removeTalentSkill:', error);
    return false;
  }
}

/**
 * Add or update education entry for a talent profile
 * @param talentId Talent profile ID
 * @param educationData Education data
 * @returns The created/updated education entry or null if an error occurred
 */
export async function upsertTalentEducation(
  talentId: string,
  educationData: Omit<TalentEducation, 'id' | 'talent_id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<TalentEducation | null> {
  try {
    if (educationData.id) {
      // Update existing education
      const { data, error } = await supabase
        .from('talent_education')
        .update({
          ...educationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', educationData.id)
        .eq('talent_id', talentId) // Safety check
        .select()
        .single();

      if (error) {
        console.error('Error updating talent education:', error);
        return null;
      }

      return data;
    } else {
      // Create new education
      const { data, error } = await supabase
        .from('talent_education')
        .insert({
          talent_id: talentId,
          ...educationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding talent education:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Exception in upsertTalentEducation:', error);
    return null;
  }
}

/**
 * Remove an education entry from a talent profile
 * @param educationId Education entry ID
 * @param talentId Talent profile ID (for safety check)
 * @returns True if successful, false otherwise
 */
export async function removeTalentEducation(educationId: string, talentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('talent_education')
      .delete()
      .eq('id', educationId)
      .eq('talent_id', talentId); // Safety check

    if (error) {
      console.error('Error removing talent education:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in removeTalentEducation:', error);
    return false;
  }
}

/**
 * Add or update experience entry for a talent profile
 * @param talentId Talent profile ID
 * @param experienceData Experience data
 * @returns The created/updated experience entry or null if an error occurred
 */
export async function upsertTalentExperience(
  talentId: string,
  experienceData: Omit<TalentExperience, 'id' | 'talent_id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<TalentExperience | null> {
  try {
    if (experienceData.id) {
      // Update existing experience
      const { data, error } = await supabase
        .from('talent_experience')
        .update({
          ...experienceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', experienceData.id)
        .eq('talent_id', talentId) // Safety check
        .select()
        .single();

      if (error) {
        console.error('Error updating talent experience:', error);
        return null;
      }

      return data;
    } else {
      // Create new experience
      const { data, error } = await supabase
        .from('talent_experience')
        .insert({
          talent_id: talentId,
          ...experienceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding talent experience:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Exception in upsertTalentExperience:', error);
    return null;
  }
}

/**
 * Remove an experience entry from a talent profile
 * @param experienceId Experience entry ID
 * @param talentId Talent profile ID (for safety check)
 * @returns True if successful, false otherwise
 */
export async function removeTalentExperience(experienceId: string, talentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('talent_experience')
      .delete()
      .eq('id', experienceId)
      .eq('talent_id', talentId); // Safety check

    if (error) {
      console.error('Error removing talent experience:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in removeTalentExperience:', error);
    return false;
  }
}

/**
 * Update talent preferences
 * @param talentId Talent profile ID
 * @param preferencesData Preferences data
 * @returns The updated preferences or null if an error occurred
 */
export async function updateTalentPreferences(
  talentId: string,
  preferencesData: Partial<Omit<TalentPreference, 'id' | 'talent_id' | 'created_at' | 'updated_at'>>
): Promise<TalentPreference | null> {
  try {
    // Check if preferences exist
    const { data: existingPreferences } = await supabase
      .from('talent_preferences')
      .select('id')
      .eq('talent_id', talentId)
      .single();

    if (existingPreferences) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('talent_preferences')
        .update({
          ...preferencesData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPreferences.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating talent preferences:', error);
        return null;
      }

      return data;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('talent_preferences')
        .insert({
          talent_id: talentId,
          ...preferencesData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating talent preferences:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Exception in updateTalentPreferences:', error);
    return null;
  }
}

/**
 * Add or update a language for a talent profile
 * @param talentId Talent profile ID
 * @param language Language name
 * @param proficiency Proficiency level
 * @returns The created/updated language or null if an error occurred
 */
export async function upsertTalentLanguage(
  talentId: string,
  language: string,
  proficiency: TalentLanguage['proficiency']
): Promise<TalentLanguage | null> {
  try {
    // Check if language already exists
    const { data: existingLanguage } = await supabase
      .from('talent_languages')
      .select('id')
      .eq('talent_id', talentId)
      .eq('language', language)
      .single();

    if (existingLanguage) {
      // Update existing language
      const { data, error } = await supabase
        .from('talent_languages')
        .update({
          proficiency,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLanguage.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating talent language:', error);
        return null;
      }

      return data;
    } else {
      // Create new language
      const { data, error } = await supabase
        .from('talent_languages')
        .insert({
          talent_id: talentId,
          language,
          proficiency,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding talent language:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Exception in upsertTalentLanguage:', error);
    return null;
  }
}

/**
 * Remove a language from a talent profile
 * @param talentId Talent profile ID
 * @param language Language name
 * @returns True if successful, false otherwise
 */
export async function removeTalentLanguage(talentId: string, language: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('talent_languages')
      .delete()
      .eq('talent_id', talentId)
      .eq('language', language);

    if (error) {
      console.error('Error removing talent language:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in removeTalentLanguage:', error);
    return false;
  }
}

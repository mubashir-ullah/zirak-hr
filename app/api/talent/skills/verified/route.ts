import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserById, updateUser } from '@/lib/database';

// GET endpoint to retrieve a user's verified skills
export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get verified skills from Supabase
    const { data: verifiedSkills, error: skillsError } = await supabase
      .from('verified_skills')
      .select('*')
      .eq('user_id', userId);
    
    if (skillsError) {
      throw skillsError;
    }
    
    // Get user profile to check if verified skills are already added
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('verified_skills')
      .eq('id', userId)
      .single();
    
    if (userError) {
      throw userError;
    }
    
    return NextResponse.json({
      verifiedSkills,
      userVerifiedSkills: userData?.verified_skills || []
    });
  } catch (error) {
    console.error('Error retrieving verified skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to update resume with verified skills
export async function POST(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { skillId } = await request.json();
    
    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    // Get the verified skill
    const { data: verifiedSkill, error: skillError } = await supabase
      .from('verified_skills')
      .select('*')
      .eq('id', skillId)
      .eq('user_id', userId)
      .single();
    
    if (skillError || !verifiedSkill) {
      return NextResponse.json({ error: 'Verified skill not found' }, { status: 404 });
    }
    
    // Get the user's resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (resumeError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    // Check if the skill already exists in the resume
    const skillExists = resume.skills && resume.skills.some((skill: string) => 
      skill.toLowerCase() === verifiedSkill.skill.toLowerCase()
    );
    
    if (!skillExists) {
      // Add the skill to the resume if it doesn't exist
      const updatedSkills = [...(resume.skills || []), verifiedSkill.skill];
      
      const { error: updateResumeError } = await supabase
        .from('resumes')
        .update({ skills: updatedSkills })
        .eq('user_id', userId);
      
      if (updateResumeError) {
        throw updateResumeError;
      }
    }
    
    // Update the user's verifiedSkills array
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('verified_skills')
      .eq('id', userId)
      .single();
    
    if (getUserError) {
      throw getUserError;
    }
    
    const currentVerifiedSkills = userData?.verified_skills || [];
    
    // Only add the skill if it's not already in the array
    if (!currentVerifiedSkills.includes(verifiedSkill.skill)) {
      const updatedVerifiedSkills = [...currentVerifiedSkills, verifiedSkill.skill];
      
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ verified_skills: updatedVerifiedSkills })
        .eq('id', userId);
      
      if (updateUserError) {
        throw updateUserError;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Resume updated with verified skill',
      skill: verifiedSkill.skill
    });
  } catch (error) {
    console.error('Error updating resume with verified skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

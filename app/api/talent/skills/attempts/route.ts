import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET endpoint to retrieve a user's test attempts
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const skillId = searchParams.get('skillId');
    
    // Build query
    let query = supabase
      .from('skill_test_attempts')
      .select('*, skill_test:skill_test_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // Filter by skill if provided
    if (skillId) {
      query = query.eq('skill_id', skillId);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ attempts: data || [] });
  } catch (error) {
    console.error('Error fetching skill test attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill test attempts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const body = await request.json();
    const { skillTestId, answers, score, passed } = body;
    
    if (!skillTestId || !answers || score === undefined || passed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create attempt record
    const { data, error } = await supabase
      .from('skill_test_attempts')
      .insert({
        user_id: userId,
        skill_test_id: skillTestId,
        answers: answers,
        score: score,
        passed: passed,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // If the test was passed, update user's verified skills
    if (passed) {
      // Get the skill ID from the test
      const { data: skillTest, error: skillTestError } = await supabase
        .from('skill_tests')
        .select('skill_id')
        .eq('id', skillTestId)
        .single();
      
      if (skillTestError) {
        throw skillTestError;
      }
      
      // Check if the user already has this skill verified
      const { data: existingSkill, error: existingSkillError } = await supabase
        .from('user_verified_skills')
        .select('id')
        .eq('user_id', userId)
        .eq('skill_id', skillTest.skill_id)
        .maybeSingle();
      
      if (existingSkillError) {
        throw existingSkillError;
      }
      
      // If not, add it to verified skills
      if (!existingSkill) {
        const { error: verifyError } = await supabase
          .from('user_verified_skills')
          .insert({
            user_id: userId,
            skill_id: skillTest.skill_id,
            test_attempt_id: data.id,
            verified_date: new Date().toISOString()
          });
        
        if (verifyError) {
          throw verifyError;
        }
      }
    }
    
    return NextResponse.json({ attempt: data });
  } catch (error) {
    console.error('Error saving skill test attempt:', error);
    return NextResponse.json(
      { error: 'Failed to save skill test attempt' },
      { status: 500 }
    );
  }
}

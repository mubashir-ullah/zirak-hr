import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get completed tests for this user
    const { data: completedTests, error: completedError } = await supabase
      .from('skill_test_attempts')
      .select(`
        id,
        score,
        passed,
        created_at,
        skill_test:skill_test_id(
          id,
          title,
          skill_category,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (completedError) {
      throw completedError;
    }
    
    // Get user's skills
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select('skill_name, proficiency')
      .eq('user_id', userId);
    
    if (skillsError) {
      throw skillsError;
    }
    
    // Build query for available tests
    let testsQuery = supabase
      .from('skill_tests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (category) {
      testsQuery = testsQuery.eq('skill_category', category);
    }
    
    if (difficulty) {
      testsQuery = testsQuery.eq('difficulty', difficulty);
    }
    
    testsQuery = testsQuery.limit(limit);
    
    const { data: availableTests, error: testsError } = await testsQuery;
    
    if (testsError) {
      throw testsError;
    }
    
    // Build query for recommended tests based on user skills
    const userSkillNames = userSkills?.map(skill => skill.skill_name) || [];
    
    let recommendedQuery = supabase
      .from('skill_tests')
      .select('*');
    
    if (userSkillNames.length > 0) {
      recommendedQuery = recommendedQuery.in('skill_name', userSkillNames);
    }
    
    // Exclude tests the user has already completed
    const completedTestIds = completedTests?.map(test => test.skill_test?.id) || [];
    if (completedTestIds.length > 0) {
      recommendedQuery = recommendedQuery.not('id', 'in', `(${completedTestIds.join(',')})`);
    }
    
    recommendedQuery = recommendedQuery.limit(5);
    
    const { data: recommendedTests, error: recommendedError } = await recommendedQuery;
    
    if (recommendedError) {
      throw recommendedError;
    }
    
    return NextResponse.json({
      completedTests: completedTests || [],
      recommendedTests: recommendedTests || [],
      availableTests: availableTests || []
    });
  } catch (error) {
    console.error('Error fetching skill tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill tests' },
      { status: 500 }
    );
  }
}

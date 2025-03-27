import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import * as SkillsAnalytics from '@/lib/skillsAnalytics';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'trending';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let result;
    
    switch (type) {
      case 'trending':
        // Get trending skills (highest demand score)
        result = await SkillsAnalytics.getTrendingSkills(limit);
        break;
        
      case 'growing':
        // Get fastest growing skills
        result = await SkillsAnalytics.getFastestGrowingSkills(limit);
        break;
        
      case 'low-competition':
        // Get skills with high demand but low competition
        result = await SkillsAnalytics.getLowCompetitionSkills(limit);
        break;
        
      case 'category':
        // Get skills by category
        if (!category) {
          return NextResponse.json(
            { error: 'Category parameter is required for type=category' },
            { status: 400 }
          );
        }
        result = await SkillsAnalytics.getSkillsByCategory(category, limit);
        break;
        
      case 'summary':
        // Get summary statistics
        result = await SkillsAnalytics.getSummaryStatistics();
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in skills analytics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills analytics data' },
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
    
    // Parse request body
    const body = await request.json();
    const { skills } = body;
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'Skills array is required' },
        { status: 400 }
      );
    }
    
    // Compare skills
    const comparisonData = await SkillsAnalytics.compareSkills(skills);
    
    return NextResponse.json({ data: comparisonData });
  } catch (error) {
    console.error('Error in skills comparison API:', error);
    return NextResponse.json(
      { error: 'Failed to compare skills' },
      { status: 500 }
    );
  }
}

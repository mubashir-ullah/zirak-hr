import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findMatchingJobsForTalent } from '@/lib/jobMatching';

export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a talent
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!userData || userData.role !== 'talent') {
      return NextResponse.json({ error: 'Unauthorized. Only talent can view job matches' }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const minScore = parseInt(searchParams.get('minScore') || '50');
    
    // Find matching jobs
    const matchingJobs = await findMatchingJobsForTalent(
      session.user.id,
      limit,
      minScore
    );
    
    if (matchingJobs === null) {
      return NextResponse.json({ error: 'Failed to find matching jobs' }, { status: 500 });
    }
    
    return NextResponse.json({
      matches: matchingJobs,
      count: matchingJobs.length
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error finding job matches:', error);
    return NextResponse.json({ error: 'Failed to find job matches' }, { status: 500 });
  }
}

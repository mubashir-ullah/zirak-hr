import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findMatchingTalentsForJob } from '@/lib/jobMatching';

export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a hiring manager
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!userData || userData.role !== 'hiring_manager') {
      return NextResponse.json({ error: 'Unauthorized. Only hiring managers can view talent matches' }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const minScore = parseInt(searchParams.get('minScore') || '50');
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Check if job belongs to this hiring manager
    const { data: job } = await supabase
      .from('jobs')
      .select('posted_by')
      .eq('id', jobId)
      .single();
    
    if (!job || job.posted_by !== session.user.id) {
      return NextResponse.json({ error: 'You can only view matches for jobs you posted' }, { status: 403 });
    }
    
    // Find matching talents
    const matchingTalents = await findMatchingTalentsForJob(
      jobId,
      limit,
      minScore
    );
    
    if (matchingTalents === null) {
      return NextResponse.json({ error: 'Failed to find matching talents' }, { status: 500 });
    }
    
    // Remove sensitive information from talent profiles
    const sanitizedTalents = matchingTalents.map(talent => ({
      id: talent.id,
      userId: talent.user_id,
      fullName: talent.full_name,
      title: talent.title,
      skills: talent.skills,
      experience: talent.experience,
      location: `${talent.city}, ${talent.country}`,
      germanLevel: talent.german_level,
      education: talent.education,
      matchScore: talent.matchScore
    }));
    
    return NextResponse.json({
      matches: sanitizedTalents,
      count: sanitizedTalents.length
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error finding talent matches:', error);
    return NextResponse.json({ error: 'Failed to find talent matches' }, { status: 500 });
  }
}

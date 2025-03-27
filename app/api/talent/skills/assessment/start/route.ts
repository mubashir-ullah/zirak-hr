import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface RouteParams {
  params: {
    id: string;
  };
}

interface Assessment {
  id: string;
  status: string;
  user_id: string;
  skill_id: string;
}

interface SkillAnalytics {
  id: string;
  skill_id: string;
  assessments_started: number;
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
    const { assessmentId } = body;
    
    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
    }
    
    // Check if assessment belongs to user
    const { data: existingAssessment, error: assessmentError } = await supabase
      .from('skill_assessments')
      .select('id, status, user_id, skill_id')
      .eq('id', assessmentId)
      .maybeSingle();
    
    if (assessmentError) {
      throw assessmentError;
    }
    
    if (!existingAssessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    
    if (existingAssessment.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to assessment' }, { status: 403 });
    }
    
    // Check if assessment is already completed
    if (existingAssessment.status === 'completed' || existingAssessment.status === 'expired') {
      return NextResponse.json({ error: 'Assessment already completed or expired' }, { status: 400 });
    }
    
    // Update assessment status to in_progress and set startTime
    const startTime = new Date();
    
    const { data: updatedAssessment, error: updateError } = await supabase
      .from('skill_assessments')
      .update({
        status: 'in_progress',
        started_at: startTime.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    // Update skill analytics to track assessment starts
    const { data: skillAnalytics, error: analyticsError } = await supabase
      .from('skill_analytics')
      .select('id, assessments_started')
      .eq('skill_id', existingAssessment.skill_id)
      .maybeSingle();
    
    if (analyticsError) {
      throw analyticsError;
    }
    
    if (skillAnalytics) {
      await supabase
        .from('skill_analytics')
        .update({
          assessments_started: (skillAnalytics.assessments_started || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', skillAnalytics.id);
    } else {
      await supabase
        .from('skill_analytics')
        .insert({
          skill_id: existingAssessment.skill_id,
          assessments_started: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Assessment started successfully',
      startTime: startTime
    });
    
  } catch (error) {
    console.error('Error starting assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

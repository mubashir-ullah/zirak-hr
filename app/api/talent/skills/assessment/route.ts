import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Define types for our data structures
interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  points: number;
  difficulty: string;
  type: string;
}

interface Option {
  id: string;
  text: string;
}

interface Answer {
  questionId: string;
  optionId: string;
}

interface Assessment {
  id: string;
  questions: Question[];
  skill_id: string;
  status: string;
  score?: number;
}

// Helper function to fetch AI-generated questions
async function fetchAIGeneratedQuestions(skillName: string, level: string, count: number = 10): Promise<any[]> {
  try {
    // Call the Python FastAPI service for AI-generated questions
    const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skill: skillName,
        level,
        count
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch AI questions: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.questions || [];
    
  } catch (error) {
    console.error('Error fetching AI-generated questions:', error);
    // Return empty array instead of null
    return [];
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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
    const status = searchParams.get('status') || '';
    const skillId = searchParams.get('skillId') || '';
    const skillName = searchParams.get('skill') || '';
    
    // Get user's skill assessments
    let query = supabase
      .from('user_skill_assessments')
      .select('*, skill:skill_id(*)')
      .eq('user_id', userId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (skillId) {
      query = query.eq('skill_id', skillId);
    }
    
    if (skillName) {
      query = query.eq('skill:skill_id(name)', skillName);
    }
    
    const { data: assessments, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ assessments: assessments || [] });
  } catch (error) {
    console.error('Error fetching skill assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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
    const { skillName, assessmentType, skillLevel } = body;
    
    if (!skillName) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      );
    }
    
    // Find the skill
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName)
      .maybeSingle();
    
    if (skillError) {
      throw skillError;
    }
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }
    
    // Check if user already has a pending or in-progress assessment for this skill
    const { data: existingAssessment, error: assessmentError } = await supabase
      .from('user_skill_assessments')
      .select('id')
      .eq('user_id', userId)
      .eq('skill_id', skill.id)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (assessmentError) {
      throw assessmentError;
    }
    
    if (existingAssessment) {
      return NextResponse.json({
        message: 'You already have an assessment for this skill',
        assessment: existingAssessment
      });
    }
    
    // Generate a new assessment
    const { data: assessment, error: createError } = await supabase
      .from('user_skill_assessments')
      .insert({
        user_id: userId,
        skill_id: skill.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      throw createError;
    }
    
    // Try to enhance the assessment with AI-generated questions if available
    try {
      const aiQuestions = await fetchAIGeneratedQuestions(
        skillName, 
        skillLevel, 
        10
      );
      
      if (aiQuestions && Array.isArray(aiQuestions) && aiQuestions.length > 0) {
        // Format AI questions to match our schema
        const formattedQuestions = aiQuestions.map((q, index) => ({
          id: `q-${index}`,
          text: q.question,
          options: q.options.map((opt, optIndex) => ({
            id: `q-${index}-opt-${optIndex}`,
            text: opt
          })),
          correctOptionId: `q-${index}-opt-${q.correctOptionIndex}`,
          type: 'multiple_choice',
          difficulty: q.difficulty,
          points: q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1
        }));
        
        // Update the assessment with AI-generated questions
        const { error: updateError } = await supabase
          .from('user_skill_assessments')
          .update({
            questions: formattedQuestions
          })
          .eq('id', assessment.id);
        
        if (updateError) {
          throw updateError;
        }
      }
    } catch (aiError) {
      console.error('Error enhancing assessment with AI questions:', aiError);
      // Continue with default questions if AI service fails
    }
    
    // Update analytics for assessment creation
    try {
      const { error: analyticsError } = await supabase
        .from('skill_analytics')
        .upsert({
          skill_id: skill.id,
          metrics: {
            assessments_taken: 1
          },
          last_updated: new Date().toISOString()
        });
      
      if (analyticsError) {
        throw analyticsError;
      }
    } catch (analyticsError) {
      console.error('Error updating skill analytics:', analyticsError);
      // Continue even if analytics update fails
    }
    
    return NextResponse.json({
      assessment
    });
  } catch (error) {
    console.error('Error creating skill assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create skill assessment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
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
    const { assessmentId, answers, timeSpent } = body;
    
    // Find the assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('user_skill_assessments')
      .select('id, questions, skill_id, status')
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (assessmentError) {
      throw assessmentError;
    }
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    
    if (assessment.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Assessment is in ${assessment.status} status and cannot be submitted` },
        { status: 400 }
      );
    }
    
    // Calculate score
    const score = answers.reduce((acc: number, answer: Answer) => {
      const question = assessment.questions.find((q: Question) => q.id === answer.questionId);
      
      if (question && question.correctOptionId === answer.optionId) {
        return acc + question.points;
      }
      
      return acc;
    }, 0);
    
    // Update assessment status and score
    const { error: updateError } = await supabase
      .from('user_skill_assessments')
      .update({
        status: 'completed',
        score,
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId);
    
    if (updateError) {
      throw updateError;
    }
    
    // Update user's profile to mark the skill as verified
    if (score >= 80) {
      const { error: profileError } = await supabase
        .from('user_skills')
        .upsert({
          user_id: userId,
          skill_id: assessment.skill_id,
          verified: true,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        throw profileError;
      }
    }
    
    // Update analytics
    try {
      const { error: analyticsError } = await supabase
        .from('skill_analytics')
        .upsert({
          skill_id: assessment.skill_id,
          metrics: {
            verified_users: score >= 80 ? 1 : 0
          },
          last_updated: new Date().toISOString()
        });
      
      if (analyticsError) {
        throw analyticsError;
      }
    } catch (analyticsError) {
      console.error('Error updating skill analytics:', analyticsError);
      // Continue even if analytics update fails
    }
    
    return NextResponse.json({
      message: 'Assessment completed successfully',
      score,
      passed: score >= 80
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}

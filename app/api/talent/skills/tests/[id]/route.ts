import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }
    
    // Verify authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get the test details
    const { data: test, error: testError } = await supabase
      .from('skill_tests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (testError) {
      if (testError.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 404 }
        );
      }
      throw testError;
    }
    
    // Check if user has already taken this test
    const { data: previousAttempt, error: attemptError } = await supabase
      .from('skill_test_attempts')
      .select('id, score, passed, created_at')
      .eq('user_id', userId)
      .eq('skill_test_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (attemptError) {
      throw attemptError;
    }
    
    // Prepare response
    const response: any = {
      test: {
        ...test,
        // Don't include correct answers in the response
        questions: test.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          options: q.options
        }))
      }
    };
    
    if (previousAttempt) {
      response.hasPreviousAttempt = true;
      response.previousScore = previousAttempt.score;
      response.previouslyPassed = previousAttempt.passed;
      response.previousAttemptDate = previousAttempt.created_at;
    } else {
      response.hasPreviousAttempt = false;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching test details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test details' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }
    
    // Verify authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const body = await request.json();
    const { answers, startTime, endTime } = body;
    
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }
    
    // Get the test details with correct answers
    const { data: test, error: testError } = await supabase
      .from('skill_tests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (testError) {
      if (testError.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 404 }
        );
      }
      throw testError;
    }
    
    // Calculate score
    let correctAnswers = 0;
    const questionsWithResults = test.questions.map((question: any, index: number) => {
      const userAnswer = answers[index];
      const isCorrect = question.correctAnswer === userAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      return {
        ...question,
        userAnswer,
        isCorrect
      };
    });
    
    const totalQuestions = test.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= test.passingScore;
    
    // Save the attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('skill_test_attempts')
      .insert({
        user_id: userId,
        skill_test_id: id,
        answers: answers,
        score: score,
        passed: passed,
        time_taken: endTime ? (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 : null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (attemptError) {
      throw attemptError;
    }
    
    // If the test was passed, update user's verified skills
    if (passed) {
      // Check if the user already has this skill verified
      const { data: existingSkill, error: existingSkillError } = await supabase
        .from('user_verified_skills')
        .select('id')
        .eq('user_id', userId)
        .eq('skill_id', test.skill_id)
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
            skill_id: test.skill_id,
            test_attempt_id: attempt.id,
            verified_date: new Date().toISOString()
          });
        
        if (verifyError) {
          throw verifyError;
        }
      }
    }
    
    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score,
        passed,
        createdAt: attempt.created_at
      },
      results: {
        score,
        passed,
        correctAnswers,
        totalQuestions,
        questionsWithResults
      }
    });
  } catch (error) {
    console.error('Error submitting test answers:', error);
    return NextResponse.json(
      { error: 'Failed to submit test answers' },
      { status: 500 }
    );
  }
}

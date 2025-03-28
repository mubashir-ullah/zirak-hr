import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserById, findJobById } from '@/lib/database';
import { 
  trackUserEvent, 
  getUserActivitySummary, 
  getJobPerformanceMetrics 
} from '@/lib/analytics';

/**
 * POST endpoint to track user events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request data
    const data = await request.json();
    const { eventType, eventData } = data;
    
    if (!eventType) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }
    
    // Track the event
    const success = await trackUserEvent(
      session.user.id,
      eventType,
      eventData || {}
    );
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Event tracked successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

/**
 * GET endpoint to retrieve user activity summary or job performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const jobId = searchParams.get('jobId');
    
    // Check if the user is a hiring manager for job performance metrics
    if (type === 'job' && jobId) {
      // Get the job to verify ownership
      const job = await findJobById(jobId);
      
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      // Get the user to check role
      const user = await findUserById(session.user.id);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Check if the user is the job poster or an admin
      if (job.posted_by !== session.user.id && user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // Get job performance metrics
      const metrics = await getJobPerformanceMetrics(jobId);
      
      if (!metrics) {
        return NextResponse.json({ error: 'Failed to retrieve job metrics' }, { status: 500 });
      }
      
      return NextResponse.json(metrics, { status: 200 });
    } else if (type === 'user') {
      // Get user activity summary
      const summary = await getUserActivitySummary(session.user.id);
      
      if (!summary) {
        return NextResponse.json({ error: 'Failed to retrieve user activity' }, { status: 500 });
      }
      
      return NextResponse.json(summary, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error retrieving analytics:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics' }, { status: 500 });
  }
}

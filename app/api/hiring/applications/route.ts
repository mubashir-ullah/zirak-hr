import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserById } from '@/lib/supabaseDb';

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized. Only hiring managers can view applications' }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    let query = supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(*),
        users!inner(id, name, email, organization, position)
      `)
      .eq('jobs.posted_by', session.user.id);
    
    // Add filters if provided
    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Execute query
    const { data: applications, error } = await query.order('applied_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedApplications = applications.slice(start, end);
    
    return NextResponse.json({
      applications: paginatedApplications,
      pagination: {
        total: applications.length,
        page,
        limit,
        pages: Math.ceil(applications.length / limit)
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

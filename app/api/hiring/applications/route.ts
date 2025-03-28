import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { findUserById, findJobApplicationsByHiringManager } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a hiring manager
    const user = await findUserById(session.user.id);
    
    if (!user || user.role !== 'hiring_manager') {
      return NextResponse.json({ error: 'Unauthorized. Only hiring managers can view applications' }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get applications using our database function
    const result = await findJobApplicationsByHiringManager(
      session.user.id,
      {
        jobId: jobId || undefined,
        status: status || undefined,
        page,
        limit,
        includeJobDetails: true,
        includeUserDetails: true
      }
    );
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
    
    return NextResponse.json({
      applications: result.data,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit)
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { updateJobApplication } from '@/lib/supabaseDb';

export async function PUT(req: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized. Only hiring managers can update application status' }, { status: 403 });
    }
    
    // Get application ID and new status from request
    const { applicationId, status, notes } = await req.json();
    
    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 });
    }
    
    // Validate status
    const validStatuses = ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }
    
    // Check if application exists and belongs to a job posted by this hiring manager
    const { data: application } = await supabase
      .from('job_applications')
      .select('*, jobs!inner(*)')
      .eq('id', applicationId)
      .single();
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Check if the job was posted by the current hiring manager
    if (application.jobs.posted_by !== session.user.id) {
      return NextResponse.json({ error: 'You can only update applications for jobs you posted' }, { status: 403 });
    }
    
    // Update application status
    const updateData: any = {
      status: status as any,
      last_status_update_date: new Date().toISOString().split('T')[0]
    };
    
    // Add notes if provided
    if (notes) {
      updateData.hiring_manager_notes = notes;
    }
    
    const updatedApplication = await updateJobApplication(applicationId, updateData);
    
    if (!updatedApplication) {
      return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Application status updated successfully',
      application: updatedApplication
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
  }
}

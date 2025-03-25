import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { createJobApplication, findJobApplicationsByUserId, findJobById, findUserById } from '@/lib/supabaseDb';

export async function POST(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, coverLetter, resumeUrl, notes } = await req.json();
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Check if job exists
    const job = await findJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Check if user has already applied to this job
    const { data: existingApplications } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('job_id', jobId);
    
    if (existingApplications && existingApplications.length > 0) {
      return NextResponse.json({ error: 'You have already applied to this job' }, { status: 400 });
    }
    
    // Get user's resume URL if not provided
    let finalResumeUrl = resumeUrl;
    if (!finalResumeUrl) {
      const user = await findUserById(session.user.id);
      finalResumeUrl = user?.resume_url || '';
    }
    
    // Create the job application
    const now = new Date().toISOString();
    const applicationData = {
      job_id: jobId,
      user_id: session.user.id,
      status: 'applied' as 'applied',
      applied_date: now.split('T')[0],
      resume_url: finalResumeUrl,
      cover_letter: coverLetter || '',
      notes: notes || '',
      last_status_update_date: now.split('T')[0]
    };
    
    const application = await createJobApplication(applicationData);
    
    if (!application) {
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }
    
    // Increment the application count for the job
    await supabase
      .from('jobs')
      .update({ application_count: (job.application_count || 0) + 1 })
      .eq('id', jobId);
    
    return NextResponse.json({ 
      message: 'Application submitted successfully',
      application
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error applying to job:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's applications
    const applications = await findJobApplicationsByUserId(session.user.id);
    
    if (!applications) {
      return NextResponse.json({ applications: [] }, { status: 200 });
    }
    
    // Get job details for each application
    const applicationsWithJobDetails = await Promise.all(
      applications.map(async (application) => {
        const job = await findJobById(application.job_id);
        return {
          ...application,
          job: job || null
        };
      })
    );
    
    return NextResponse.json({ applications: applicationsWithJobDetails }, { status: 200 });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

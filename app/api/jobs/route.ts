import { NextResponse } from 'next/server';
import { 
  getAllJobs, 
  createJob, 
  updateJob,
  findOrCreateSkill,
  updateJobSkills,
  updateJobBenefits,
  updateJobRequirements,
  findJobById
} from '@/lib/database';
import supabase from '@/lib/supabase';

// GET /api/jobs - Get all jobs
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    const companyId = url.searchParams.get('companyId');
    const postedBy = url.searchParams.get('postedBy');
    
    const filters = {
      status: status,
      ...(companyId && { company_id: companyId }),
      ...(postedBy && { posted_by: postedBy })
    };
    
    const jobs = await getAllJobs(filters);
    
    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: Request) {
  try {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const jobData = await request.json();
    
    // Validate required fields
    if (!jobData.title || !jobData.company_id || !jobData.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Extract skills, benefits, and requirements from the job data
    const { skills, benefits, requirements, ...jobDetails } = jobData;
    
    // Set default values
    const now = new Date();
    const newJob = {
      ...jobDetails,
      posted_by: session.user.id,
      posted_date: jobDetails.status === 'active' ? now.toISOString().split('T')[0] : null,
      application_count: 0,
      view_count: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    
    // Create the job
    const job = await createJob(newJob);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }
    
    // Add skills to the job
    if (skills && skills.length > 0) {
      const skillPromises = skills.map(async (skillName) => {
        const skill = await findOrCreateSkill(skillName);
        if (skill) {
          return {
            job_id: job.id,
            skill_id: skill.id,
            importance: 3 // Default importance
          };
        }
        return null;
      });
      
      const jobSkills = (await Promise.all(skillPromises)).filter(Boolean);
      if (jobSkills.length > 0) {
        await updateJobSkills(job.id, jobSkills);
      }
    }
    
    // Add benefits to the job
    if (benefits && benefits.length > 0) {
      await updateJobBenefits(job.id, benefits.map((benefit) => ({
        job_id: job.id,
        benefit: benefit
      })));
    }
    
    // Add requirements to the job
    if (requirements && requirements.length > 0) {
      await updateJobRequirements(job.id, requirements.map((requirement) => ({
        job_id: job.id,
        requirement: requirement
      })));
    }
    
    // Get the complete job with all relations
    const completeJob = await findJobById(job.id);
    
    return NextResponse.json(completeJob, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/:id - Update a job
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.pathname.split('/').pop();
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    const jobData = await request.json();
    
    // Extract skills, benefits, and requirements from the job data
    const { skills, benefits, requirements, ...jobDetails } = jobData;
    
    // Update the job details
    const updatedJob = await updateJob(jobId, {
      ...jobDetails,
      updated_at: new Date().toISOString()
    });
    
    if (!updatedJob) {
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      );
    }
    
    // Update skills if provided
    if (skills) {
      const skillPromises = skills.map(async (skillName) => {
        const skill = await findOrCreateSkill(skillName);
        if (skill) {
          return {
            job_id: jobId,
            skill_id: skill.id,
            importance: 3 // Default importance
          };
        }
        return null;
      });
      
      const jobSkills = (await Promise.all(skillPromises)).filter(Boolean);
      await updateJobSkills(jobId, jobSkills);
    }
    
    // Update benefits if provided
    if (benefits) {
      await updateJobBenefits(jobId, benefits.map((benefit) => ({
        job_id: jobId,
        benefit: benefit
      })));
    }
    
    // Update requirements if provided
    if (requirements) {
      await updateJobRequirements(jobId, requirements.map((requirement) => ({
        job_id: jobId,
        requirement: requirement
      })));
    }
    
    // Get the complete updated job with all relations
    const completeJob = await findJobById(jobId);
    
    return NextResponse.json(completeJob, { status: 200 });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

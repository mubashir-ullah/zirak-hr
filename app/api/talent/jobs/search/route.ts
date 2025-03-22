import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import Job from '@/models/Job';
import SavedJob from '@/models/SavedJob';
import JobApplication from '@/models/JobApplication';

// GET endpoint to search for jobs with filters
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToMongoose();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const jobType = searchParams.get('jobType') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const remote = searchParams.get('remote') === 'true';
    const visaSponsorship = searchParams.get('visaSponsorship') === 'true';
    const minSalary = searchParams.get('minSalary') ? parseInt(searchParams.get('minSalary')!) : undefined;
    const skills = searchParams.get('skills') ? searchParams.get('skills')!.split(',') : [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { status: 'active' };

    // Text search if query is provided
    if (query) {
      filter.$text = { $search: query };
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (jobType) {
      filter.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Remote filter
    if (remote) {
      filter.remote = true;
    }

    // Visa sponsorship filter
    if (visaSponsorship) {
      filter.visaSponsorship = true;
    }

    // Salary filter
    if (minSalary) {
      filter['salary.min'] = { $gte: minSalary };
    }

    // Skills filter
    if (skills.length > 0) {
      filter.skills = { $in: skills };
    }

    // Get user's saved and applied jobs
    const userId = session.user.id;
    const savedJobs = await SavedJob.find({ userId }).select('jobId');
    const appliedJobs = await JobApplication.find({ userId }).select('jobId');
    
    const savedJobIds = savedJobs.map(job => job.jobId.toString());
    const appliedJobIds = appliedJobs.map(job => job.jobId.toString());

    // Execute query with pagination
    const jobs = await Job.find(filter)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);

    // Add saved and applied status to each job
    const enhancedJobs = jobs.map(job => ({
      ...job,
      isSaved: savedJobIds.includes(job._id.toString()),
      isApplied: appliedJobIds.includes(job._id.toString())
    }));

    return NextResponse.json({
      jobs: enhancedJobs,
      pagination: {
        total: totalJobs,
        page,
        limit,
        pages: Math.ceil(totalJobs / limit)
      }
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json({ error: 'Failed to search jobs' }, { status: 500 });
  }
}

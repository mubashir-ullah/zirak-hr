import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import JobApplication from '@/models/JobApplication';
import Job from '@/models/Job';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoose();
    
    const { jobId, coverLetter, resumeUrl, notes } = await req.json();
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Check if user has already applied to this job
    const existingApplication = await JobApplication.findOne({
      userId: session.user.id,
      jobId
    });
    
    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this job' }, { status: 400 });
    }
    
    // Get user's resume URL if not provided
    let finalResumeUrl = resumeUrl;
    if (!finalResumeUrl) {
      const user = await User.findById(session.user.id);
      finalResumeUrl = user?.resumeUrl || '';
    }
    
    // Create the job application
    const application = new JobApplication({
      userId: session.user.id,
      jobId,
      status: 'applied',
      appliedDate: new Date(),
      resumeUrl: finalResumeUrl,
      coverLetter: coverLetter || '',
      notes: notes || '',
      lastStatusUpdateDate: new Date()
    });
    
    await application.save();
    
    // Increment the application count for the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });
    
    return NextResponse.json({ 
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error applying to job:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoose();
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = { userId: session.user.id };
    if (status) {
      filter.status = status;
    }
    
    // Find applications with pagination
    const applications = await JobApplication.find(filter)
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('jobId')
      .lean();
    
    // Get total count for pagination
    const totalApplications = await JobApplication.countDocuments(filter);
    
    return NextResponse.json({
      applications,
      pagination: {
        total: totalApplications,
        page,
        limit,
        pages: Math.ceil(totalApplications / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { verifyToken } from '@/lib/auth';
import { findJobs } from '@/app/models/job';

// GET endpoint to search for jobs with filters
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userData = await verifyToken(request);
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const query: any = { status: 'Active' };
    
    // Apply filters if provided
    if (searchParams.has('keyword')) {
      const keyword = searchParams.get('keyword');
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (searchParams.has('location')) {
      query.location = { $regex: searchParams.get('location'), $options: 'i' };
    }
    
    if (searchParams.has('employmentType')) {
      query.employmentType = searchParams.get('employmentType');
    }
    
    if (searchParams.has('experienceLevel')) {
      query.experienceLevel = searchParams.get('experienceLevel');
    }
    
    if (searchParams.has('remoteOption')) {
      query.remoteOption = searchParams.get('remoteOption');
    }
    
    if (searchParams.has('visaSponsorship')) {
      query.visaSponsorship = searchParams.get('visaSponsorship') === 'true';
    }
    
    if (searchParams.has('germanRequired')) {
      query.germanRequired = searchParams.get('germanRequired');
    }
    
    if (searchParams.has('skill')) {
      const skills = searchParams.getAll('skill');
      if (skills.length > 0) {
        query.skills = { $in: skills };
      }
    }
    
    // Get pagination parameters
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Connect to database
    const db = await connectToDatabase();
    
    // Find jobs matching the query
    const jobs = await findJobs(db, query, limit, skip);
    
    // Count total jobs for pagination
    const totalJobs = await db.models.Job.countDocuments(query);
    
    return NextResponse.json({ 
      jobs,
      pagination: {
        total: totalJobs,
        page,
        limit,
        pages: Math.ceil(totalJobs / limit)
      }
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

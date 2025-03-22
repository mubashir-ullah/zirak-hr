import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import JobApplication from '@/models/JobApplication';
import Job from '@/models/Job';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoose();
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'appliedDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { userId: session.user.id };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Create aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' }
    ];
    
    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'job.title': { $regex: search, $options: 'i' } },
            { 'job.company': { $regex: search, $options: 'i' } },
            { 'job.location': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }
    
    // Count total documents for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    
    // Add sorting
    const sortField = sortBy === 'company' ? 'job.company' : 
                      sortBy === 'title' ? 'job.title' : 
                      sortBy === 'status' ? 'status' : 'appliedDate';
    
    pipeline.push({ 
      $sort: { 
        [sortField]: sortOrder === 'asc' ? 1 : -1,
        // Secondary sort by appliedDate if not already sorting by it
        ...(sortField !== 'appliedDate' ? { appliedDate: -1 } : {})
      } 
    });
    
    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    
    // Project only needed fields
    pipeline.push({
      $project: {
        _id: 1,
        status: 1,
        appliedDate: 1,
        lastStatusUpdateDate: 1,
        interviews: 1,
        job: {
          _id: 1,
          title: 1,
          company: 1,
          location: 1,
          jobType: 1,
          salary: 1,
          description: 1
        },
        matchScore: 1
      }
    });
    
    // Execute queries
    const [applications, countResult] = await Promise.all([
      JobApplication.aggregate(pipeline),
      JobApplication.aggregate(countPipeline)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import SavedJob from '@/models/SavedJob';

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
    const skip = (page - 1) * limit;
    
    // Find saved jobs with pagination
    const savedJobs = await SavedJob.find({ userId: session.user.id })
      .sort({ savedDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('jobId')
      .lean();
    
    // Get total count for pagination
    const totalSavedJobs = await SavedJob.countDocuments({ userId: session.user.id });
    
    return NextResponse.json({
      savedJobs,
      pagination: {
        total: totalSavedJobs,
        page,
        limit,
        pages: Math.ceil(totalSavedJobs / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import JobApplication from '@/models/JobApplication';
import { User } from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoose();
    
    const applicationId = params.id;
    const { feedback } = await req.json();
    
    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback message is required' }, { status: 400 });
    }
    
    // Find application
    const application = await JobApplication.findById(applicationId);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Check if the application belongs to the current user
    if (application.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Initialize feedback array if it doesn't exist
    if (!application.feedback) {
      application.feedback = [];
    }
    
    // Get user details for the feedback
    const user = await User.findById(session.user.id).select('name email profilePicture').lean();
    
    // Add feedback to the application
    application.feedback.push({
      message: feedback,
      sentBy: 'candidate',
      senderDetails: {
        userId: session.user.id,
        name: user?.name || 'Candidate',
        email: user?.email || '',
        profilePicture: user?.profilePicture || ''
      },
      sentAt: new Date(),
      isRead: false
    });
    
    // Update lastStatusUpdateDate to show activity
    application.lastStatusUpdateDate = new Date();
    
    await application.save();
    
    return NextResponse.json({ 
      success: true, 
      feedback: application.feedback[application.feedback.length - 1] 
    });
  } catch (error) {
    console.error('Error sending feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

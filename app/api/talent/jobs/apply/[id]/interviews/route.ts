import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import JobApplication from '@/models/JobApplication';

// GET - Retrieve all interviews for an application
export async function GET(
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
    
    // Find application
    const application = await JobApplication.findById(applicationId)
      .select('interviews userId')
      .lean();
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Check if the application belongs to the current user
    if (application.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json({ interviews: application.interviews || [] });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Confirm or reschedule an interview
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
    const { interviewId, action, newDate, notes } = await req.json();
    
    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
    }
    
    if (!['confirm', 'reschedule', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (action === 'reschedule' && !newDate) {
      return NextResponse.json({ error: 'New date is required for rescheduling' }, { status: 400 });
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
    
    // Find the interview
    const interviewIndex = application.interviews.findIndex(
      (interview) => interview._id.toString() === interviewId
    );
    
    if (interviewIndex === -1) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }
    
    const interview = application.interviews[interviewIndex];
    
    // Update interview based on action
    switch (action) {
      case 'confirm':
        // Just add notes if provided
        if (notes) {
          interview.notes = notes;
        }
        break;
      
      case 'reschedule':
        interview.date = new Date(newDate);
        if (notes) {
          interview.notes = interview.notes 
            ? `${interview.notes}\n\nRescheduled: ${notes}`
            : `Rescheduled: ${notes}`;
        }
        break;
      
      case 'cancel':
        interview.status = 'cancelled';
        if (notes) {
          interview.notes = interview.notes 
            ? `${interview.notes}\n\nCancelled: ${notes}`
            : `Cancelled: ${notes}`;
        }
        break;
    }
    
    // Update the interview in the array
    application.interviews[interviewIndex] = interview;
    
    // Update lastStatusUpdateDate to show activity
    application.lastStatusUpdateDate = new Date();
    
    await application.save();
    
    return NextResponse.json({ 
      success: true, 
      interview: application.interviews[interviewIndex]
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

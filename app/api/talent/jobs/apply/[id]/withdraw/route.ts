import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import JobApplication from '@/models/JobApplication';

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
    const { reason } = await req.json();
    
    // Find application
    const application = await JobApplication.findById(applicationId);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Check if the application belongs to the current user
    if (application.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Check if application is already withdrawn
    if (application.status === 'withdrawn') {
      return NextResponse.json({ error: 'Application is already withdrawn' }, { status: 400 });
    }
    
    // Add status history entry
    if (!application.statusHistory) {
      application.statusHistory = [];
    }
    
    application.statusHistory.push({
      status: application.status,
      date: application.lastStatusUpdateDate,
      note: 'Previous status before withdrawal'
    });
    
    // Update application status
    application.status = 'withdrawn';
    application.lastStatusUpdateDate = new Date();
    application.notes = application.notes ? `${application.notes}\n\nWithdrawal reason: ${reason}` : `Withdrawal reason: ${reason}`;
    
    // Add withdrawal reason to status history
    application.statusHistory.push({
      status: 'withdrawn',
      date: new Date(),
      note: `Withdrawn by candidate. Reason: ${reason}`
    });
    
    await application.save();
    
    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

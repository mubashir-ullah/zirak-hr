import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToMongoose from '@/lib/mongoose';
import SavedJob from '@/models/SavedJob';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoose();
    
    const { savedJobId, notes } = await req.json();
    
    if (!savedJobId) {
      return NextResponse.json({ error: 'Saved job ID is required' }, { status: 400 });
    }
    
    // Find the saved job and verify ownership
    const savedJob = await SavedJob.findById(savedJobId);
    
    if (!savedJob) {
      return NextResponse.json({ error: 'Saved job not found' }, { status: 404 });
    }
    
    if (savedJob.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this saved job' }, { status: 403 });
    }
    
    // Update the notes
    savedJob.notes = notes || '';
    await savedJob.save();
    
    return NextResponse.json({ 
      message: 'Notes updated successfully',
      savedJob
    });
  } catch (error) {
    console.error('Error updating saved job notes:', error);
    return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
  }
}

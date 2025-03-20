import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const applicationsCollection = db.collection('applications');
    
    // Define the recruitment stages we want to track
    const stageCategories = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired'];
    
    // In a real implementation, you would query the database for applications by stage
    // For now, we'll use mock data that would typically come from aggregation queries
    
    // This is sample data - in a real app, you would use MongoDB aggregation to count by stage
    const stageCounts: { [key: string]: number } = {
      'Applied': 100,
      'Screening': 60,
      'Interview': 40,
      'Assessment': 25,
      'Offer': 15,
      'Hired': 10
    };
    
    // Format the data for the chart
    const data = stageCategories.map(category => stageCounts[category] || 0);
    
    return NextResponse.json({
      labels: stageCategories,
      data
    });
    
  } catch (error) {
    console.error('Error fetching stage analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stage analytics' },
      { status: 500 }
    );
  }
}

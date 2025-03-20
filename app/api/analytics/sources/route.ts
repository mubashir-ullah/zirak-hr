import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    
    const { db } = await connectToDatabase();
    const applicationsCollection = db.collection('applications');
    
    // Calculate time filter based on timeRange
    const currentDate = new Date();
    let dateFilter = new Date();
    
    switch (timeRange) {
      case 'week':
        dateFilter.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        dateFilter.setMonth(currentDate.getMonth() - 1);
        break;
      case 'quarter':
        dateFilter.setMonth(currentDate.getMonth() - 3);
        break;
      case 'year':
        dateFilter.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        dateFilter.setMonth(currentDate.getMonth() - 1);
    }
    
    // Define the source categories we want to track
    const sourceCategories = ['LinkedIn', 'Website', 'Referrals', 'Job Boards', 'Other'];
    
    // In a real implementation, you would query the database for applications by source
    // For now, we'll use mock data that would typically come from aggregation queries
    
    // This is sample data - in a real app, you would use MongoDB aggregation to count by source
    const sourceCounts: { [key: string]: number } = {
      'LinkedIn': 40,
      'Website': 25,
      'Referrals': 15,
      'Job Boards': 15,
      'Other': 5
    };
    
    // Format the data for the chart
    const data = sourceCategories.map(category => sourceCounts[category] || 0);
    
    return NextResponse.json({
      labels: sourceCategories,
      data
    });
    
  } catch (error) {
    console.error('Error fetching source analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch source analytics' },
      { status: 500 }
    );
  }
}

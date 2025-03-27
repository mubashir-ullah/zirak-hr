import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const jobsCollection = db.collection('jobs');
    
    // Define the department categories we want to track
    const departmentCategories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations'];
    
    // In a real implementation, you would query the database for jobs by department
    // For now, we'll use mock data that would typically come from aggregation queries
    
    // This is sample data - in a real app, you would use MongoDB aggregation to count by department
    const departmentCounts: { [key: string]: number } = {
      'Engineering': 5,
      'Design': 3,
      'Marketing': 2,
      'Sales': 3,
      'Operations': 2
    };
    
    // Format the data for the chart
    const data = departmentCategories.map(category => departmentCounts[category] || 0);
    
    return NextResponse.json({
      labels: departmentCategories,
      data
    });
    
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department analytics' },
      { status: 500 }
    );
  }
}

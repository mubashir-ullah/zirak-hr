import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    
    // Calculate time periods and labels based on timeRange
    const currentDate = new Date();
    let dateFilter = new Date();
    let labels: string[] = [];
    let periodFormat: string;
    
    switch (timeRange) {
      case 'week':
        dateFilter.setDate(currentDate.getDate() - 7);
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        periodFormat = 'day';
        break;
      case 'month':
        dateFilter.setMonth(currentDate.getMonth() - 1);
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        periodFormat = 'week';
        break;
      case 'quarter':
        dateFilter.setMonth(currentDate.getMonth() - 3);
        // Get last 3 months names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 2; i >= 0; i--) {
          const monthIndex = (currentDate.getMonth() - i + 12) % 12;
          labels.push(monthNames[monthIndex]);
        }
        periodFormat = 'month';
        break;
      case 'year':
        dateFilter.setFullYear(currentDate.getFullYear() - 1);
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        periodFormat = 'quarter';
        break;
      default:
        dateFilter.setMonth(currentDate.getMonth() - 1);
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        periodFormat = 'week';
    }
    
    // Get application data for each period
    const applicationData: number[] = [];
    
    // Query Supabase for application data
    // For now, we'll use the same random data approach as the original,
    // but in a real implementation, you would query Supabase for each period
    
    // Example of how to query applications from Supabase:
    // const { data, error } = await supabase
    //   .from('applications')
    //   .select('count')
    //   .gte('created_at', dateFilter.toISOString())
    //   .order('created_at', { ascending: true });
    
    // For demonstration, we'll generate random data
    for (let i = 0; i < labels.length; i++) {
      // This is where you would query for applications in each time period
      // For now, generate random data between 5 and 25
      applicationData.push(Math.floor(Math.random() * 20) + 5);
    }
    
    return NextResponse.json({
      labels,
      data: applicationData
    });
    
  } catch (error) {
    console.error('Error fetching application analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application analytics' },
      { status: 500 }
    );
  }
}

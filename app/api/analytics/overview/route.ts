import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    
    const { db } = await connectToDatabase();
    
    // Get jobs collection data
    const jobsCollection = db.collection('jobs');
    const totalJobs = await jobsCollection.countDocuments();
    const activeJobs = await jobsCollection.countDocuments({ status: 'active' });
    
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
    
    // Get applications data (assuming we have an applications collection)
    const applicationsCollection = db.collection('applications');
    const totalCandidates = await applicationsCollection.countDocuments();
    const recentApplications = await applicationsCollection.countDocuments({
      applicationDate: { $gte: dateFilter }
    });
    
    // Calculate average time to hire (in days)
    const hiredApplications = await applicationsCollection.find({
      status: 'hired',
      hireDate: { $gte: dateFilter }
    }).toArray();
    
    let totalDays = 0;
    hiredApplications.forEach((app: any) => {
      const applicationDate = new Date(app.applicationDate);
      const hireDate = new Date(app.hireDate);
      const days = Math.floor((hireDate.getTime() - applicationDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += days;
    });
    
    const timeToHire = hiredApplications.length > 0 ? Math.round(totalDays / hiredApplications.length) : 0;
    
    // Calculate conversion rate (applications to hires)
    const totalApplicationsPeriod = await applicationsCollection.countDocuments({
      applicationDate: { $gte: dateFilter }
    });
    
    const conversionRate = totalApplicationsPeriod > 0 
      ? Math.round((hiredApplications.length / totalApplicationsPeriod) * 100 * 10) / 10
      : 0;
    
    // Calculate cost metrics (mock data for now)
    const costPerHire = 4250;
    const hiringEfficiency = 78;
    const retentionRate = 85;
    const qualityOfHire = 82;
    
    return NextResponse.json({
      totalJobs,
      activeJobs,
      totalCandidates,
      applications: recentApplications,
      timeToHire,
      conversionRate,
      costPerHire,
      hiringEfficiency,
      retentionRate,
      qualityOfHire
    });
    
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}

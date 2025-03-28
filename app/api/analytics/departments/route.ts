import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Define the department categories we want to track
    const departmentCategories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations'];
    
    // Query Supabase for job counts by department
    const { data, error } = await supabase
      .from('jobs')
      .select('department')
      .in('department', departmentCategories);
    
    if (error) {
      throw error;
    }
    
    // Count jobs by department
    const departmentCounts: { [key: string]: number } = {};
    
    // Initialize counts to 0
    departmentCategories.forEach(dept => {
      departmentCounts[dept] = 0;
    });
    
    // Count jobs for each department
    data.forEach(job => {
      if (job.department && departmentCategories.includes(job.department)) {
        departmentCounts[job.department]++;
      }
    });
    
    // Format the data for the chart
    const chartData = departmentCategories.map(category => departmentCounts[category] || 0);
    
    return NextResponse.json({
      labels: departmentCategories,
      data: chartData
    });
    
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    
    // For development purposes, return mock data if there's an error
    const mockData = [5, 3, 2, 3, 2]; // Engineering, Design, Marketing, Sales, Operations
    
    return NextResponse.json({
      labels: departmentCategories,
      data: mockData,
      mock: true
    });
  }
}

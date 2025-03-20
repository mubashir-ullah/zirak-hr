import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    // Define the department categories we want to track
    const departmentCategories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations'];
    
    // Define the cost breakdown categories
    const costCategories = ['Advertising', 'Recruiter Time', 'Tools & Software', 'Onboarding', 'Other'];
    
    // In a real implementation, you would query the database for efficiency metrics by department
    // For now, we'll use mock data that would typically come from aggregation queries
    
    // This is sample data - in a real app, you would calculate these metrics from actual data
    const efficiencyData: { [key: string]: number } = {
      'Engineering': 85,
      'Design': 72,
      'Marketing': 90,
      'Sales': 78,
      'Operations': 65
    };
    
    const costData: { [key: string]: number } = {
      'Advertising': 1200,
      'Recruiter Time': 1800,
      'Tools & Software': 650,
      'Onboarding': 400,
      'Other': 200
    };
    
    // Format the data for the charts
    const efficiencyValues = departmentCategories.map(category => efficiencyData[category] || 0);
    const costValues = costCategories.map(category => costData[category] || 0);
    
    return NextResponse.json({
      efficiencyData: {
        labels: departmentCategories,
        data: efficiencyValues
      },
      costData: {
        labels: costCategories,
        data: costValues
      },
      metrics: {
        costPerHire: 4250,
        hiringEfficiency: 78,
        retentionRate: 85,
        qualityOfHire: 82
      }
    });
    
  } catch (error) {
    console.error('Error fetching efficiency analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch efficiency analytics' },
      { status: 500 }
    );
  }
}

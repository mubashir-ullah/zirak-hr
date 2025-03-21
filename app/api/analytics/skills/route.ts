import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import SkillAnalytics from '@/app/models/skillAnalytics';
import TechnicalSkill from '@/app/models/technicalSkill';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'trending';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    let result;
    
    switch (type) {
      case 'trending':
        // Get trending skills (highest demand score)
        result = await SkillAnalytics.getTrendingSkills(limit);
        break;
        
      case 'growing':
        // Get fastest growing skills
        result = await SkillAnalytics.getFastestGrowingSkills(limit);
        break;
        
      case 'low-competition':
        // Get skills with high demand but low competition
        result = await SkillAnalytics.getLowCompetitionSkills(limit);
        break;
        
      case 'category':
        // Get skills by category
        if (!category) {
          return NextResponse.json(
            { error: 'Category parameter is required for type=category' },
            { status: 400 }
          );
        }
        result = await SkillAnalytics.getSkillsByCategory(category, limit);
        break;
        
      case 'summary':
        // Get summary statistics for all skills
        result = await getSummaryStatistics(db);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      type,
      category: category || undefined,
      data: result
    });
    
  } catch (error) {
    console.error('Error fetching skill analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill analytics' },
      { status: 500 }
    );
  }
}

// Helper function to get summary statistics
async function getSummaryStatistics(db: any) {
  // Get total counts
  const totalSkills = await TechnicalSkill.countDocuments();
  const totalVerifiedUsers = await db.collection('skillanalytics').aggregate([
    {
      $group: {
        _id: null,
        totalVerifiedUsers: { $sum: '$metrics.verifiedUsers' }
      }
    }
  ]).toArray();
  
  // Get top categories by demand
  const topCategories = await db.collection('skillanalytics').aggregate([
    {
      $group: {
        _id: '$category',
        averageDemand: { $avg: '$marketInsights.demandScore' },
        skillCount: { $sum: 1 }
      }
    },
    { $sort: { averageDemand: -1 } },
    { $limit: 5 }
  ]).toArray();
  
  // Get average assessment scores by category
  const assessmentScoresByCategory = await db.collection('skillanalytics').aggregate([
    {
      $group: {
        _id: '$category',
        averageScore: { $avg: '$metrics.averageAssessmentScore' },
        totalAssessments: { $sum: '$metrics.assessmentsTaken' }
      }
    },
    { $sort: { averageScore: -1 } }
  ]).toArray();
  
  // Get job posting trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const jobPostingTrends = await db.collection('skillanalytics').aggregate([
    { $unwind: '$timeSeries' },
    { $match: { 'timeSeries.date': { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timeSeries.date' } },
        jobPostings: { $sum: '$timeSeries.jobPostings' },
        applications: { $sum: '$timeSeries.applications' },
        searches: { $sum: '$timeSeries.searches' }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray();
  
  return {
    totalSkills,
    totalVerifiedUsers: totalVerifiedUsers[0]?.totalVerifiedUsers || 0,
    topCategories,
    assessmentScoresByCategory,
    jobPostingTrends
  };
}

// API endpoint for skill demand comparison
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    if (!body.skills || !Array.isArray(body.skills) || body.skills.length === 0) {
      return NextResponse.json(
        { error: 'Skills array is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Get analytics for the specified skills
    const skillsAnalytics = await SkillAnalytics.find({
      skillName: { $in: body.skills }
    }).lean();
    
    // If some skills don't have analytics, get their basic info
    const foundSkillNames = skillsAnalytics.map(sa => sa.skillName);
    const missingSkills = body.skills.filter(s => !foundSkillNames.includes(s));
    
    let missingSkillsData = [];
    if (missingSkills.length > 0) {
      missingSkillsData = await TechnicalSkill.find({
        name: { $in: missingSkills }
      }).lean();
    }
    
    // Prepare the comparison data
    const comparisonData = skillsAnalytics.map(sa => ({
      name: sa.skillName,
      category: sa.category,
      demandScore: sa.marketInsights.demandScore,
      growthRate: sa.marketInsights.growthRate,
      competitionLevel: sa.marketInsights.competitionLevel,
      jobPostings: sa.metrics.jobPostings,
      averageAssessmentScore: sa.metrics.averageAssessmentScore,
      verifiedUsers: sa.metrics.verifiedUsers,
      salaryRange: sa.marketInsights.salaryRange,
      relatedSkills: sa.marketInsights.relatedSkills.slice(0, 5)
    }));
    
    // Add basic data for skills without analytics
    missingSkillsData.forEach(skill => {
      comparisonData.push({
        name: skill.name,
        category: skill.category,
        demandScore: null,
        growthRate: null,
        competitionLevel: null,
        jobPostings: 0,
        averageAssessmentScore: null,
        verifiedUsers: 0,
        salaryRange: null,
        relatedSkills: []
      });
    });
    
    return NextResponse.json({
      comparisonData,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error comparing skill analytics:', error);
    return NextResponse.json(
      { error: 'Failed to compare skill analytics' },
      { status: 500 }
    );
  }
}

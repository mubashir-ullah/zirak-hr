import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get time range from query params
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get('timeRange') || 'month'
    
    // Connect to database
    const { db } = await connectToDatabase()
    
    // Get company ID from user profile
    const userProfile = await db.collection('users').findOne({
      email: session.user.email
    })
    
    if (!userProfile || !userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'User profile or company not found' },
        { status: 404 }
      )
    }
    
    const companyId = userProfile.companyId
    
    // Calculate date range based on timeRange
    const now = new Date()
    let startDate = new Date()
    let previousStartDate = new Date()
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        previousStartDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setDate(now.getDate() - 30)
        previousStartDate.setDate(startDate.getDate() - 30)
        break
      case 'quarter':
        startDate.setDate(now.getDate() - 90)
        previousStartDate.setDate(startDate.getDate() - 90)
        break
      case 'year':
        startDate.setDate(now.getDate() - 365)
        previousStartDate.setDate(startDate.getDate() - 365)
        break
      default:
        startDate.setDate(now.getDate() - 30)
        previousStartDate.setDate(startDate.getDate() - 30)
    }
    
    // Get jobs data for current period
    const jobsQuery = {
      companyId: new ObjectId(companyId),
      createdAt: { $gte: startDate }
    }
    
    const activeJobsQuery = {
      ...jobsQuery,
      status: 'active'
    }
    
    const totalJobs = await db.collection('jobs').countDocuments(jobsQuery)
    const activeJobs = await db.collection('jobs').countDocuments(activeJobsQuery)
    
    // Get jobs data for previous period
    const previousJobsQuery = {
      companyId: new ObjectId(companyId),
      createdAt: { $gte: previousStartDate, $lt: startDate }
    }
    
    const previousActiveJobsQuery = {
      ...previousJobsQuery,
      status: 'active'
    }
    
    const previousTotalJobs = await db.collection('jobs').countDocuments(previousJobsQuery)
    const previousActiveJobs = await db.collection('jobs').countDocuments(previousActiveJobsQuery)
    
    // Calculate percentage changes
    const totalJobsChange = previousTotalJobs > 0 
      ? ((totalJobs - previousTotalJobs) / previousTotalJobs) * 100 
      : 0
    
    const activeJobsChange = previousActiveJobs > 0 
      ? ((activeJobs - previousActiveJobs) / previousActiveJobs) * 100 
      : 0
    
    // Get applications data for current period
    const applicationsQuery = {
      companyId: new ObjectId(companyId),
      createdAt: { $gte: startDate }
    }
    
    const totalApplications = await db.collection('applications').countDocuments(applicationsQuery)
    
    // Get applications data for previous period
    const previousApplicationsQuery = {
      companyId: new ObjectId(companyId),
      createdAt: { $gte: previousStartDate, $lt: startDate }
    }
    
    const previousTotalApplications = await db.collection('applications').countDocuments(previousApplicationsQuery)
    
    // Calculate percentage change
    const totalApplicationsChange = previousTotalApplications > 0 
      ? ((totalApplications - previousTotalApplications) / previousTotalApplications) * 100 
      : 0
    
    // Get candidates data for current period
    const candidatesQuery = {
      companyId: new ObjectId(companyId),
      createdAt: { $gte: startDate }
    }
    
    const totalCandidates = await db.collection('candidates').countDocuments(candidatesQuery)
    
    // Get candidates data for previous period
    const previousCandidatesQuery = {
      companyId: new ObjectId(companyId),
      createdAt: { $gte: previousStartDate, $lt: startDate }
    }
    
    const previousTotalCandidates = await db.collection('candidates').countDocuments(previousCandidatesQuery)
    
    // Calculate percentage change
    const totalCandidatesChange = previousTotalCandidates > 0 
      ? ((totalCandidates - previousTotalCandidates) / previousTotalCandidates) * 100 
      : 0
    
    // Get time to hire data
    const hiredApplications = await db.collection('applications')
      .find({
        companyId: new ObjectId(companyId),
        status: 'hired',
        hiredAt: { $gte: startDate }
      })
      .toArray()
    
    const timeToHireValues = hiredApplications.map(app => {
      const createdAt = new Date(app.createdAt).getTime()
      const hiredAt = new Date(app.hiredAt).getTime()
      return Math.floor((hiredAt - createdAt) / (1000 * 60 * 60 * 24)) // Convert to days
    })
    
    const averageTimeToHire = timeToHireValues.length > 0 
      ? timeToHireValues.reduce((sum, value) => sum + value, 0) / timeToHireValues.length 
      : 0
    
    // Get previous time to hire data
    const previousHiredApplications = await db.collection('applications')
      .find({
        companyId: new ObjectId(companyId),
        status: 'hired',
        hiredAt: { $gte: previousStartDate, $lt: startDate }
      })
      .toArray()
    
    const previousTimeToHireValues = previousHiredApplications.map(app => {
      const createdAt = new Date(app.createdAt).getTime()
      const hiredAt = new Date(app.hiredAt).getTime()
      return Math.floor((hiredAt - createdAt) / (1000 * 60 * 60 * 24)) // Convert to days
    })
    
    const previousAverageTimeToHire = previousTimeToHireValues.length > 0 
      ? previousTimeToHireValues.reduce((sum, value) => sum + value, 0) / previousTimeToHireValues.length 
      : 0
    
    // Calculate percentage change
    const averageTimeToHireChange = previousAverageTimeToHire > 0 
      ? ((averageTimeToHire - previousAverageTimeToHire) / previousAverageTimeToHire) * 100 
      : 0
    
    // Calculate conversion rate (hired / applications)
    const conversionRate = totalApplications > 0 
      ? (hiredApplications.length / totalApplications) * 100 
      : 0
    
    const previousConversionRate = previousTotalApplications > 0 
      ? (previousHiredApplications.length / previousTotalApplications) * 100 
      : 0
    
    // Calculate percentage change
    const conversionRateChange = previousConversionRate > 0 
      ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 
      : 0
    
    // Return stats
    return NextResponse.json({
      success: true,
      stats: {
        totalJobs,
        totalJobsChange,
        activeJobs,
        activeJobsChange,
        totalCandidates,
        totalCandidatesChange,
        totalApplications,
        totalApplicationsChange,
        averageTimeToHire,
        averageTimeToHireChange,
        conversionRate,
        conversionRateChange
      }
    })
    
  } catch (error) {
    console.error('Error fetching overview stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overview stats' },
      { status: 500 }
    )
  }
}

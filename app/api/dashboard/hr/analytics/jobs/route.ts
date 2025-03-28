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
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setDate(now.getDate() - 30)
        break
      case 'quarter':
        startDate.setDate(now.getDate() - 90)
        break
      case 'year':
        startDate.setDate(now.getDate() - 365)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }
    
    // Get jobs grouped by department
    const jobsByDepartment = await db.collection('jobs')
      .aggregate([
        {
          $match: {
            companyId: new ObjectId(companyId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
      .toArray()
    
    // Format data for Chart.js
    const labels = jobsByDepartment.map(item => item._id || 'Other')
    const data = jobsByDepartment.map(item => item.count)
    
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Jobs by Department',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }
      ]
    }
    
    return NextResponse.json({
      success: true,
      data: chartData
    })
    
  } catch (error) {
    console.error('Error fetching jobs data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs data' },
      { status: 500 }
    )
  }
}

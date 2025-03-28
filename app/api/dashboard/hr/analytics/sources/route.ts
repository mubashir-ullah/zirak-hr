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
    
    // Get applications grouped by source
    const applicationsBySource = await db.collection('applications')
      .aggregate([
        {
          $match: {
            companyId: new ObjectId(companyId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
      .toArray()
    
    // Format data for Chart.js
    const labels = applicationsBySource.map(item => item._id || 'Other')
    const data = applicationsBySource.map(item => item.count)
    
    // Define colors for the chart
    const backgroundColors = [
      'rgba(54, 162, 235, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(201, 203, 207, 0.6)'
    ]
    
    const borderColors = [
      'rgba(54, 162, 235, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(201, 203, 207, 1)'
    ]
    
    // Ensure we have enough colors by repeating the arrays if needed
    const getColor = (index: number, colorArray: string[]) => {
      return colorArray[index % colorArray.length]
    }
    
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Application Sources',
          data,
          backgroundColor: labels.map((_, index) => getColor(index, backgroundColors)),
          borderColor: labels.map((_, index) => getColor(index, borderColors)),
          borderWidth: 1
        }
      ]
    }
    
    return NextResponse.json({
      success: true,
      data: chartData
    })
    
  } catch (error) {
    console.error('Error fetching sources data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources data' },
      { status: 500 }
    )
  }
}

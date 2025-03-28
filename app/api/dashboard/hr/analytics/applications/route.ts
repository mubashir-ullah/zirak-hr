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
    let labels: string[] = []
    let intervals: { start: Date, end: Date }[] = []
    
    switch (timeRange) {
      case 'week':
        // Last 7 days
        startDate.setDate(now.getDate() - 7)
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        // Create daily intervals for the past week
        for (let i = 6; i >= 0; i--) {
          const start = new Date()
          start.setDate(now.getDate() - i)
          start.setHours(0, 0, 0, 0)
          
          const end = new Date(start)
          end.setHours(23, 59, 59, 999)
          
          intervals.push({ start, end })
        }
        break
        
      case 'month':
        // Last 4 weeks
        startDate.setDate(now.getDate() - 28)
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        
        // Create weekly intervals for the past month
        for (let i = 0; i < 4; i++) {
          const start = new Date()
          start.setDate(now.getDate() - 28 + (i * 7))
          start.setHours(0, 0, 0, 0)
          
          const end = new Date(start)
          end.setDate(start.getDate() + 6)
          end.setHours(23, 59, 59, 999)
          
          intervals.push({ start, end })
        }
        break
        
      case 'quarter':
        // Last 3 months
        startDate.setMonth(now.getMonth() - 3)
        
        // Create monthly labels for the past quarter
        for (let i = 2; i >= 0; i--) {
          const monthDate = new Date()
          monthDate.setMonth(now.getMonth() - i)
          labels.push(monthDate.toLocaleString('default', { month: 'short' }))
        }
        
        // Create monthly intervals for the past quarter
        for (let i = 2; i >= 0; i--) {
          const start = new Date()
          start.setMonth(now.getMonth() - i, 1)
          start.setHours(0, 0, 0, 0)
          
          const end = new Date(start)
          end.setMonth(start.getMonth() + 1, 0)
          end.setHours(23, 59, 59, 999)
          
          intervals.push({ start, end })
        }
        break
        
      case 'year':
        // Last 12 months
        startDate.setFullYear(now.getFullYear() - 1)
        
        // Create monthly labels for the past year
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date()
          monthDate.setMonth(now.getMonth() - i)
          labels.push(monthDate.toLocaleString('default', { month: 'short' }))
        }
        
        // Create monthly intervals for the past year
        for (let i = 11; i >= 0; i--) {
          const start = new Date()
          start.setMonth(now.getMonth() - i, 1)
          start.setHours(0, 0, 0, 0)
          
          const end = new Date(start)
          end.setMonth(start.getMonth() + 1, 0)
          end.setHours(23, 59, 59, 999)
          
          intervals.push({ start, end })
        }
        break
        
      default:
        // Default to month
        startDate.setDate(now.getDate() - 28)
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        
        // Create weekly intervals for the past month
        for (let i = 0; i < 4; i++) {
          const start = new Date()
          start.setDate(now.getDate() - 28 + (i * 7))
          start.setHours(0, 0, 0, 0)
          
          const end = new Date(start)
          end.setDate(start.getDate() + 6)
          end.setHours(23, 59, 59, 999)
          
          intervals.push({ start, end })
        }
    }
    
    // Get application counts for each interval
    const applicationCounts = await Promise.all(
      intervals.map(async ({ start, end }) => {
        const count = await db.collection('applications').countDocuments({
          companyId: new ObjectId(companyId),
          createdAt: { $gte: start, $lte: end }
        })
        return count
      })
    )
    
    // Format data for Chart.js
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Applications',
          data: applicationCounts,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    }
    
    return NextResponse.json({
      success: true,
      data: chartData
    })
    
  } catch (error) {
    console.error('Error fetching applications data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications data' },
      { status: 500 }
    )
  }
}

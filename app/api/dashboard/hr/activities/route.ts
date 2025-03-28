import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    
    if (!client) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    
    const db = client.db()
    
    // Get user info to find company
    const user = await db.collection('users').findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get company info
    const company = await db.collection('companies').findOne({ userEmail: session.user.email })
    
    if (!company) {
      return NextResponse.json({ 
        success: true,
        activities: [],
        message: 'No company information found'
      })
    }
    
    // Get recent activities
    // This would typically be a collection of events like new applications, interviews, etc.
    // For now, we'll create a placeholder collection if it doesn't exist
    const activitiesCollection = db.collection('activities')
    
    // Check if the collection has any documents
    const activitiesCount = await activitiesCollection.countDocuments({
      companyId: company._id.toString()
    })
    
    // If no activities exist, create some sample ones
    if (activitiesCount === 0) {
      const sampleActivities = [
        {
          companyId: company._id.toString(),
          type: 'application',
          title: 'New application received',
          description: 'John Doe applied for Senior Developer position',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: 'UserPlus',
          color: 'green'
        },
        {
          companyId: company._id.toString(),
          type: 'interview',
          title: 'Interview scheduled',
          description: 'Interview with Sarah Smith for UX Designer position',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          icon: 'CheckCircle',
          color: 'blue'
        },
        {
          companyId: company._id.toString(),
          type: 'job',
          title: 'New job posted',
          description: 'Marketing Manager position has been published',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          icon: 'Briefcase',
          color: 'purple'
        },
        {
          companyId: company._id.toString(),
          type: 'candidate',
          title: 'Candidate shortlisted',
          description: 'Michael Brown shortlisted for Frontend Developer',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          icon: 'Users',
          color: 'yellow'
        }
      ]
      
      await activitiesCollection.insertMany(sampleActivities)
    }
    
    // Get the most recent activities
    const activities = await activitiesCollection
      .find({ companyId: company._id.toString() })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()
    
    return NextResponse.json({
      success: true,
      activities: activities.map(activity => ({
        ...activity,
        _id: activity._id.toString()
      }))
    })
  } catch (error) {
    console.error('Error fetching HR dashboard activities:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard activities' }, { status: 500 })
  }
}

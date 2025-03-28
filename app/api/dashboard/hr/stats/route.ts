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
        stats: {
          activeJobs: 0,
          totalCandidates: 0,
          pendingApplications: 0,
          scheduledInterviews: 0
        },
        message: 'No company information found'
      })
    }
    
    // Get job postings count
    const activeJobs = await db.collection('jobs').countDocuments({ 
      companyId: company._id.toString(),
      status: 'active'
    })
    
    // Get candidates count
    const totalCandidates = await db.collection('candidates').countDocuments({
      companyId: company._id.toString()
    })
    
    // Get pending applications count
    const pendingApplications = await db.collection('applications').countDocuments({
      companyId: company._id.toString(),
      status: 'pending'
    })
    
    // Get scheduled interviews count
    const scheduledInterviews = await db.collection('interviews').countDocuments({
      companyId: company._id.toString(),
      status: 'scheduled'
    })
    
    return NextResponse.json({
      success: true,
      stats: {
        activeJobs,
        totalCandidates,
        pendingApplications,
        scheduledInterviews
      }
    })
  } catch (error) {
    console.error('Error fetching HR dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 })
  }
}

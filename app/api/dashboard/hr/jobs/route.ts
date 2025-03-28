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
        jobs: [],
        message: 'No company information found'
      })
    }
    
    // Get job postings
    const jobsCollection = db.collection('jobs')
    
    // Check if the collection has any documents
    const jobsCount = await jobsCollection.countDocuments({
      companyId: company._id.toString()
    })
    
    // If no jobs exist, create some sample ones
    if (jobsCount === 0) {
      const now = new Date()
      const sampleJobs = [
        {
          companyId: company._id.toString(),
          title: 'Senior Frontend Developer',
          type: 'Full-time',
          location: 'Remote',
          applicants: 12,
          postedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          closingDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          status: 'active'
        },
        {
          companyId: company._id.toString(),
          title: 'UX Designer',
          type: 'Full-time',
          location: 'On-site',
          applicants: 8,
          postedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          closingDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
          status: 'active'
        },
        {
          companyId: company._id.toString(),
          title: 'Marketing Manager',
          type: 'Full-time',
          location: 'Hybrid',
          applicants: 4,
          postedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          closingDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
          status: 'active'
        },
        {
          companyId: company._id.toString(),
          title: 'Backend Developer',
          type: 'Full-time',
          location: 'Remote',
          applicants: 9,
          postedDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          closingDate: new Date(now.getTime() + 26 * 24 * 60 * 60 * 1000), // 26 days from now
          status: 'active'
        }
      ]
      
      await jobsCollection.insertMany(sampleJobs)
    }
    
    // Get active job postings
    const jobs = await jobsCollection
      .find({ 
        companyId: company._id.toString(),
        status: 'active'
      })
      .sort({ postedDate: -1 })
      .limit(10)
      .toArray()
    
    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
        ...job,
        _id: job._id.toString()
      }))
    })
  } catch (error) {
    console.error('Error fetching HR dashboard jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch job postings' }, { status: 500 })
  }
}

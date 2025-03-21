import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import SkillAssessment from '@/app/models/skillAssessment'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user email from session
    const userEmail = session.user.email
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }
    
    // Parse request body
    const body = await request.json()
    const { assessmentId } = body
    
    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }
    
    // Connect to database
    const { db } = await connectToDatabase()
    
    // Find user by email
    const user = await db.collection('users').findOne({ email: userEmail })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Find assessment by ID
    const assessment = await db.collection('skillAssessments').findOne({
      _id: new ObjectId(assessmentId)
    })
    
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    
    // Check if assessment belongs to user
    if (assessment.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized access to assessment' }, { status: 403 })
    }
    
    // Check if assessment is already completed
    if (assessment.status === 'completed' || assessment.status === 'expired') {
      return NextResponse.json({ error: 'Assessment already completed or expired' }, { status: 400 })
    }
    
    // Update assessment status to in_progress and set startTime
    const startTime = new Date()
    
    await db.collection('skillAssessments').updateOne(
      { _id: new ObjectId(assessmentId) },
      { 
        $set: { 
          status: 'in_progress',
          startTime: startTime,
          updatedAt: new Date()
        } 
      }
    )
    
    // Update skill analytics to track assessment starts
    await db.collection('skillAnalytics').updateOne(
      { skillId: assessment.skillId },
      { 
        $inc: { 
          'assessments.started': 1 
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'Assessment started successfully',
      startTime: startTime
    })
    
  } catch (error) {
    console.error('Error starting assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

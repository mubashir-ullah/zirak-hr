import { NextRequest, NextResponse } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the prompt from the request body
    const { prompt } = await req.json()

    // Validate the prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    // Create the system message
    const systemMessage = `You are an AI talent matching assistant for HR professionals. 
    Your task is to analyze job requirements and candidate profiles to provide insights on matching.
    Be concise, professional, and focus on actionable insights.
    Highlight strengths, potential gaps, and recommendations for the hiring process.
    Keep your response under 200 words.`

    // Create the completion with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true
    })

    // Convert the response to a streaming text response
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in talent matching API:', error)
    return NextResponse.json(
      { error: 'Failed to process the request' },
      { status: 500 }
    )
  }
}

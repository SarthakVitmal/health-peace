// File: /app/api/whisper/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Get the form data with the audio file
    const formData = await req.formData()
    const audioFile = formData.get('file') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }
    
    // Create a new FormData for the Groq API request
    const groqFormData = new FormData()
    groqFormData.append('file', audioFile)
    groqFormData.append('model', 'whisper-large-v3') // Use the correct Groq model name
    
    // Send the request to Groq's speech-to-text API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: groqFormData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('Groq API error:', error)
      return NextResponse.json(
        { error: error.error?.message || 'Failed to transcribe audio' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
import { NextRequest, NextResponse } from 'next/server';
import Session from '@/models/Session';
import Groq from 'groq-sdk';
import { connectToDatabase } from '@/app/lib/db';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

interface Message {
  sender: string;
  text: string;
}

interface SessionType {
  _id: string;
  userId: string;
  status: string;
  endedAt?: Date;
  summary?: string;
  messages: Message[];
  createdAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idIndex = pathParts.indexOf('sessions') + 1;
    const sessionId = pathParts[idIndex];

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID not found' }, { status: 404 });
    }

    await connectToDatabase();
    const currentSession = await Session.findById(sessionId); // Corrected to findById
    if (!currentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const pastSessions = await Session.find({
      userId: currentSession.userId,
      status: "ended",
      _id: { $ne: sessionId }
    })
      .sort({ endedAt: -1 })
      .limit(3)
      .lean();

    const transcript: string = currentSession.messages
      .map((msg: Message) => `${msg.sender === 'user' ? 'User' : 'MindEase'}: ${msg.text}`)
      .join('\n\n');

    const pastSummaries = pastSessions
      .filter(s => s.summary)
      .map(s => `Session on ${s.endedAt?.toLocaleDateString() || 'unknown date'}:\n${s.summary}`)
      .join('\n\n');

    const summaryCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a mental health assistant analyzing a therapy session. 
          ${pastSummaries ? `Previous Insights:\n${pastSummaries}\n\n` : ''}
          Generate a 3-4 sentence summary of this session highlighting:
          1. Key themes and progress
          2. Emotional patterns
          3. Recommended follow-up actions`
        },
        {
          role: 'user',
          content: `Session Transcript:\n${transcript}`
        }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 400
    });

    const summary = summaryCompletion.choices[0]?.message?.content || "No summary generated.";

    const updatedSession = await Session.findByIdAndUpdate( // Corrected to findByIdAndUpdate
      sessionId, 
      {
        summary,
        endedAt: new Date(),
        status: "ended",
        relatedSessions: pastSessions.map(s => s._id)
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true,
      summary,
      relatedSessions: pastSessions.length,
      sessionId: updatedSession?._id
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate summary',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error) // Corrected to instance of
        })
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const idIndex = pathParts.indexOf('sessions') + 1;
    const sessionId = pathParts[idIndex];

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID not found' }, { status: 404 });
    }

    await connectToDatabase();
    const session = await Session.findById(sessionId); // Corrected to findById

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      summary: session.summary,
      status: session.status,
      endedAt: session.endedAt
    });

  } catch (error) {
    console.error('Error retrieving session summary:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve session summary',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error) // Corrected to instance of
        })
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import Session from '@/models/Session';
import { connectToDatabase } from '@/app/lib/db';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: Request) {
  try {
    const { message, sessionId, userId } = await req.json();
    await connectToDatabase();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    // 1. Store user message
    await Session.findByIdAndUpdate(sessionId, {
      $push: {
        messages: {
          text: message,
          sender: "user",
          timestamp: new Date()
        }
      }
    });

    // 2. Get session history if user asks about past conversations
    let historyContext = '';
    if (message.toLowerCase().includes('what did we talk') ||
      message.toLowerCase().includes('previous session') || message.toLowerCase().includes('What was our last session about') ||
      message.toLowerCase().includes('previous conversations') || message.toLowerCase().includes('past conversations') || message.toLowerCase().includes('past session') || message.toLowerCase().includes('What was our last session about')) {

      const pastSessions = await Session.find({
        userId,
        status: "ended",
        _id: { $ne: sessionId }
      })
        .sort({ endedAt: -1 })
        .limit(3)
        .select('summary endedAt messages');

      historyContext = pastSessions.map((session: { endedAt: Date; summary: string; messages: { text: string }[] }) =>
        `Session on ${session.endedAt.toLocaleDateString()}:\n` +
        `Summary: ${session.summary}\n` +
        `Last messages: ${session.messages.slice(-3).map((m: { text: string }) => m.text).join(', ')}`
      ).join('\n\n');
    }

    // 3. Get current session context
    interface Message {
      text: string;
      sender: string;
      timestamp: Date;
    }

    interface SessionDocument {
      _id: string;
      userId: string;
      status: string;
      endedAt?: Date;
      summary?: string;
      messages: Message[];
    }

    const currentSession = await Session.findById(sessionId) as SessionDocument | null;

    const currentContext = currentSession?.messages
      .slice(-10)
      .map((m: Message) => `${m.sender}: ${m.text}`)
      .join('\n') || 'No current context';

    // 4. Generate AI response with context
    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are MindEase, an AI mental health companion designed to provide:
- Compassionate, judgment-free support
- Evidence-based therapeutic techniques
- Personalized emotional guidance
- Safe space for self-reflection

${historyContext ? `Previous Sessions Recap:\n${historyContext}\n\n` : ''}
Current Session Context:\n${currentContext}\n\n
Core Principles:
1. Practice active listening and validate emotions
2. Use CBT and mindfulness techniques when appropriate
3. Maintain professional boundaries while being warm
4. Focus on strengths and coping strategies
5. Encourage self-awareness and growth

Response Guidelines:
- Keep responses conversational yet therapeutic
- When referencing past sessions, mention specific dates/themes
- For crisis situations, suggest professional resources
- Limit responses to 3-4 sentences unless more detail is requested
- Always end with an open-ended question to continue dialogue`
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 150
    });

    const botResponse = groqResponse.choices[0]?.message?.content || "I couldn't generate a response.";

    // 5. Store bot response
    await Session.findByIdAndUpdate(sessionId, {
      $push: {
        messages: {
          text: botResponse,
          sender: "bot",
          timestamp: new Date()
        }
      }
    });

    return NextResponse.json({ message: botResponse });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Error processing your message' },
      { status: 500 }
    );
  }
}
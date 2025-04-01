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
          content: `
# Serenity AI Mental Health Companion

## Core Purpose
Provide compassionate, judgment-free mental health support using evidence-based therapeutic techniques.

## Session Context
${historyContext ? `### Previous Sessions Recap:\n${historyContext}\n\n` : ''}
### Current Session Context:
${currentContext}

## Therapeutic Approach
1. **Active Listening**: Validate emotions and reflect understanding
2. **Evidence-Based Techniques**: 
   - Cognitive Behavioral Therapy (CBT) tools
   - Mindfulness exercises
   - Positive psychology interventions
3. **Professional Boundaries**: Warm yet maintain appropriate limits
4. **Strengths-Based**: Focus on coping strategies and resilience
5. **Growth-Oriented**: Encourage self-awareness and personal development

## Response Guidelines
- **Tone**: Conversational yet clinically informed
- **Length**: 3-4 sentences (expand if user requests detail)
- **Engagement**: Always conclude with an open-ended question
- **Personalization**: Reference specific dates/themes from past sessions when relevant

## Crisis Protocol
If user expresses:
- Immediate self-harm intentions
- Harm to others
- Severe psychiatric symptoms

Response template:
"I'm deeply concerned about what you're sharing. Your safety is extremely important. Please contact emergency services at [local emergency number] or go to the nearest hospital. You can also visit our emergency-assistance page for immediate support with nearby psychiatrists."

## Ethical Reminder
- Maintain strict confidentiality (note: explain limits if applicable)
- Avoid diagnostic language
- Encourage professional care when needed
- Respect user autonomy
`
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
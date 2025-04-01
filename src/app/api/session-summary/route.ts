import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    const { messages, sessionDate } = await request.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Format date for display (e.g., "March 15, 2024")
    const formattedDate = sessionDate ? new Date(sessionDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) : 'a previous session';

    // Convert messages to a summary text with timestamps
    const summaryText = messages.map(
      (msg: any) => {
        const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
        return `${msg.sender === 'user' ? 'User' : 'Bot'}${timestamp ? ` [${timestamp}]` : ''}: ${msg.text}`;
      }
    ).join('\n');

    // Generate a concise summary using Groq
    const summaryChatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a mental health assistant creating session summaries. 
          Provide a concise, sensitive summary of the conversation from ${formattedDate}. 
          Include key themes, emotional context, and any notable patterns, but avoid specific personal details.
          Structure your response with:
           1. Date and time reference
          2. Main topics discussed
          3. Emotional tone analysis
          4. Notable patterns or insights
          5. Any suggested follow-up topics or actions`
        },
        {
          role: 'user',
          content: `Conversation on ${formattedDate}:\n${summaryText}`
        }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3, 
      max_tokens: 100   
    });

    const summary = summaryChatCompletion.choices[0]?.message?.content || 'No summary generated';

    console.log(`Session Summary for ${formattedDate}:`, summary);

    return NextResponse.json({ 
      success: true, 
      summary,
      sessionDate: formattedDate
    });
  } catch (error) {
    console.error('Session Summary Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate session summary' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
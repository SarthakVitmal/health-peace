// app/api/session-summary/route.ts
import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Convert messages to a summary text
    const summaryText = messages.map(
      (msg: any) => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.text}`
    ).join('\n');

    // Generate a concise summary using Groq
    const summaryChatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Provide a concise, sensitive summary of the mental health conversation. Focus on key themes and emotional context without revealing specific details.'
        },
        {
          role: 'user',
          content: summaryText
        }
      ],
      model: 'mixtral-8x7b-32768' // Specify the model you want to use
    });

    console.log('Session Summary:', summaryChatCompletion.choices[0]?.message?.content);

    return NextResponse.json({ 
      success: true, 
      summary: summaryChatCompletion.choices[0]?.message?.content 
    });
  } catch (error) {
    console.error('Session Summary Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate session summary' },
      { status: 500 }
    );
  }
}

// Optionally add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
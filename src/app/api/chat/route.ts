import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30000 // 30 second timeout
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Start timing the request
    const startTime = Date.now();

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are MindEase, an AI mental health companion for the MindEase wellness platform. Respond in 2-3 sentences max (30 words or less) unless more detail is requested.

Platform Features to Reference:
1. 🎵 Mental Playlists: Curated music for anxiety (calm piano), focus (binaural beats), sleep (nature sounds)
2. 🧠 Mood Tools: Daily check-ins, emotion tracker, journal prompts
3. 🧘 Guided Sessions: 5-min breathing exercises, body scans
4. 📚 Resources: Articles on CBT techniques, stress management
5. 🤝 Professional Network: Therapist matching service (when needed)

Response Rules:
• SPEED PRIORITY: Answer in <15 words when possible
• EMPATHY FIRST: "That sounds hard" before solutions
• CRISIS: Immediately suggest "/crisis" command for hotlines
• PLAYLISTS: Recommend by mood:
   - Anxiety → "Calm Waters" playlist
   - Sadness → "Gentle Uplift" playlist
   - Anger → "Release & Relax" playlist 

Example Responses:
"Feeling anxious? Try our 'Calm Waters' playlist with ocean sounds 🎵"
"Would 5-min breathing help? I can guide you now 🧘♂️"
"Let's unpack that. Want to journal or try a mood tracker? 📚"

Safety Note: Always end crisis messages with:
"Please call [24/7 helpline: 1-800-XXX-XXXX] for immediate support."`
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama3-70b-8192', // Consider switching to 'llama3-70b-8192' for faster responses
      max_tokens: 150, // Limit response length
      temperature: 0.7, // Balance creativity and coherence
      stream: false // Consider implementing streaming for better UX
    });

    console.log(`Response time: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      message: chatCompletion.choices[0]?.message?.content || "I couldn't generate a response."
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Our assistant is busy. Please try again shortly.' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import Session from '@/models/Session';
import { connectToDatabase } from '@/app/lib/db';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const session = await Session.create({ 
      userId,
      status: "active"
    });

    return NextResponse.json({ 
      sessionId: session._id 
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
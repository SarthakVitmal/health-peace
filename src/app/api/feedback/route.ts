import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';
import Feedback from '@/models/Feedback';

export async function POST(request: NextRequest) {
  try {
    const { feedbackType, rating, feedback, userName, email } = await request.json();
    
    // Validate required fields
    if (!feedbackType || !rating || !feedback || !userName || !email) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get start and end of current day
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Check for existing feedback from this email today
    const existingFeedback = await Feedback.findOne({
      email,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (existingFeedback) {
      return NextResponse.json(
        { 
          success: false,
          error: "You've already submitted feedback today. Please try again tomorrow.",
          existingFeedback
        },
        { status: 429 } // 429 Too Many Requests
      );
    }

    const newFeedback = await Feedback.create({
      feedbackType,
      rating,
      feedback,
      userName,
      email
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Feedback recorded successfully.",
        feedback: newFeedback 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback submission error:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to record feedback.";
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import Mood from "@/models/Mood";

export async function POST(request: NextRequest) {
  try {
    const { userId, mood } = await request.json();
    console.log("Received data:", { userId, mood });

    await connectToDatabase();

    // Create date in UTC without timezone offset
    const today = new Date();
    const utcDate = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));

    const tomorrow = new Date(utcDate);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const existingMood = await Mood.findOne({
      userId,
      date: { $gte: utcDate, $lt: tomorrow }
    });

    if (existingMood) {
      return NextResponse.json(
        { 
          message: "Mood already recorded today", 
          alreadyRecorded: true,
          mood: existingMood 
        },
        { status: 200 }
      );
    }

    const newMood = await Mood.create({ 
      userId, 
      mood, 
      date: utcDate // Store as pure UTC date
    });
    
    return NextResponse.json(
      { message: "Mood recorded successfully.", mood: newMood },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording mood:", error);
    return NextResponse.json(
      { error: "Failed to record mood." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const month = searchParams.get("month");
    const date = searchParams.get("date");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    if (date) {
      // Handle single date query in UTC
      const queryDate = new Date(date);
      const utcDate = new Date(Date.UTC(
        queryDate.getUTCFullYear(),
        queryDate.getUTCMonth(),
        queryDate.getUTCDate(),
        0, 0, 0, 0
      ));
      
      const nextDay = new Date(utcDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const mood = await Mood.findOne({
        userId,
        date: {
          $gte: utcDate,
          $lt: nextDay,
        },
      });

      return NextResponse.json({ mood }, { status: 200 });
    } else if (month) {
      // Handle month query in UTC
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0, 0));

      const moods = await Mood.find({
        userId,
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      return NextResponse.json({ moods }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Either month or date parameter is required." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching mood data:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood data." },
      { status: 500 }
    );
  }
}
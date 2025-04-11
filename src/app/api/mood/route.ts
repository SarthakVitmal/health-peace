import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import Mood from "@/models/Mood";

export async function POST(request: NextRequest) {
  try {
    const { userId, mood, today } = await request.json();
    console.log("Received data:", { userId, mood, today });

    await connectToDatabase();

    // Parse the date string from the client (yyyy-MM-dd format)
    const [year, month, day] = today.split('-').map(Number);
    
    // Create date in UTC to avoid timezone issues
    const todayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const tomorrowUTC = new Date(todayUTC);
    tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

    console.log("Date range for query:", {
      todayUTC,
      tomorrowUTC,
      isoString: todayUTC.toISOString()
    });

    const existingMood = await Mood.findOne({
      userId,
      date: { $gte: todayUTC, $lt: tomorrowUTC }
    });

    if (existingMood) {
      return NextResponse.json(
        { 
          message: "Mood already recorded today", 
          alreadyRecorded: true,
          mood: existingMood,
        },
        { status: 200 }
      );
    }

    const newMood = await Mood.create({ 
      userId, 
      mood, 
      date: todayUTC
    });
    
    return NextResponse.json(
      { 
        message: "Mood recorded successfully.", 
        mood: newMood,
        storedDate: newMood.date.toISOString()
      },
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
      // Handle single date query
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const mood = await Mood.findOne({
        userId,
        date: {
          $gte: queryDate,
          $lt: nextDay,
        },
      });

      return NextResponse.json({ mood }, { status: 200 });
    } else if (month) {
      // Handle month query (existing functionality)
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

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
    return NextResponse.json(
      { error: "Failed to fetch mood data." },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import Mood from "@/models/Mood";

export async function POST(request: NextRequest) {
  try {
    const { userId, mood, date } = await request.json();
    console.log("Received data:", { userId, mood, date }); 

    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingMood = await Mood.findOne({ userId, date: { $gte: today } });

    if (existingMood) {
      return NextResponse.json(
        { message: "Mood already recorded today" },
        { status: 200 }
      );
    }

    await Mood.create({ userId, mood, date: new Date() });
    return NextResponse.json(
      { message: "Mood recorded successfully." },
      { status: 201 }
    );
  } catch (error) {
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
      const month = searchParams.get("month"); // Format: "YYYY-MM"
  
      if (!userId || !month) {
        return NextResponse.json(
          { error: "User ID and month are required." },
          { status: 400 }
        );
      }
  
      await connectToDatabase();
  
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
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch mood data." },
        { status: 500 }
      );
    }
  }
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/db";
import Mood from "@/models/Mood";

export async function POST(request: NextRequest) {
  try {
    const { userId, mood, date } = await request.json();
    console.log("Received data:", { userId, mood, date }); // Log incoming data

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
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const moodEntry = await Mood.findOne({ date: { $gte: today } });

    if (moodEntry) {
      return NextResponse.json({ logged: true, mood: moodEntry.mood });
    } else {
      return NextResponse.json({ logged: false });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch mood status." },
      { status: 500 }
    );
  }
}
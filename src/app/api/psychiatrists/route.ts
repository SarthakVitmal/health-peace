import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Psychiatrists from "@/models/Psychiatrists"; 

const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string";

mongoose.connect(MONGO_URI);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");

  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 });
  }

  try {
    const psychiatrists = await Psychiatrists.find({ location: { $regex: new RegExp(location, "i") } });

    if (psychiatrists.length === 0) {
      return NextResponse.json({ message: "No psychiatrists found" }, { status: 404 });
    }

    return NextResponse.json(psychiatrists);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching psychiatrists" }, { status: 500 });
  }
}

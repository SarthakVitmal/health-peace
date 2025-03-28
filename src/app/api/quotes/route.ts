import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({
      q: "Fallback quote when API fails",
      a: "Anonymous"
    }, { status: 200 });
  }
}
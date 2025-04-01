// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function GET(request:Request) {
  const response = NextResponse.json({ success: true });
  
  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0)
  });
  
  return response;
}
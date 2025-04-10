// /app/api/auth/validate/route.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.json({ 
        isAuthenticated: true,
        user: decoded 
      }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 500 });
  }
}
// /app/api/auth/validate/route.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false, error: "Missing token" },
        { status: 401, headers: securityHeaders() }
      );
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { exp: number };
      return NextResponse.json(
        { 
          isAuthenticated: true,
          expiresAt: decoded.exp,
          user: decoded
        },
        { headers: securityHeaders() }
      );
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { isAuthenticated: false, error: "Token expired" },
          { status: 401, headers: securityHeaders() }
        );
      }
      return NextResponse.json(
        { isAuthenticated: false, error: "Invalid token" },
        { status: 401, headers: securityHeaders() }
      );
    }
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { isAuthenticated: false, error: "Server error" },
      { status: 500, headers: securityHeaders() }
    );
  }
}

function securityHeaders() {
  return {
    'Content-Security-Policy': "default-src 'self'",
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}
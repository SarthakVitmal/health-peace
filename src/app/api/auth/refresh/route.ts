// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST() {
  try {
    // 1. Get the current token from cookies
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }

    // 2. Verify the current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      exp: number;
    };

    // 3. Check if token is expired (shouldn't happen if refresh is called properly)
    if (Date.now() >= decoded.exp * 1000) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    // 4. Create new token with same payload but new expiration
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' } // Same expiration as original token
    );

    // 5. Set the new token in cookies
    (await cookies()).set({
      name: 'token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 // 1 hour
    });

    // 6. Return new expiration time
    const newExp = Math.floor(Date.now() / 1000) + 60 * 60;
    return NextResponse.json({ 
      success: true,
      expiresAt: newExp
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
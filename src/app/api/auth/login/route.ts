import { NextResponse, NextRequest } from 'next/server';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();  
    const reqBody = await request.json();
    const { email, password } = reqBody;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }
    
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      );
    }

    const tokenData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
    };

    // Create token without expiration
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!);
    
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    }, { status: 200 });
    
    response.cookies.set('token', token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });
    
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "An error occurred during login. Please try again later." },
      { status: 500 }
    );
  }
}
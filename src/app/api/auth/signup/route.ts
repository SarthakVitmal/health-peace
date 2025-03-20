import { NextResponse } from 'next/server'
import User from '@/models/User'
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../lib/db'

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { firstname,lastname, phone, email, password } = await req.json()
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists with this email address" }, 
                { status: 400 }
            );
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            firstName: firstname,
            lastName: lastname,
            email,
            phone,
            password: hashedPassword,
        });

        await newUser.save();
        return NextResponse.json(
            { message: 'User registered successfully' }, 
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        
        return NextResponse.json(
            { message: 'An error occurred during registration. Please try again later.' },
            { status: 500 }
        );
    }
}
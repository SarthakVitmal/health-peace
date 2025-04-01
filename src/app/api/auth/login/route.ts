import { NextResponse ,NextRequest } from 'next/server';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/db'
import { toast } from 'sonner';

export async function POST(request:NextRequest){
  try {
    await connectToDatabase();  
    const reqBody = await request.json();
    const {email,password} = reqBody;

    const user = await User.findOne({email:email})
    if(!user){
        return NextResponse.json({error:"User does not exist"},{status:400})
    }
    
    const validPassword = await bcryptjs.compare(password,user.password)
    if(!validPassword){
        return NextResponse.json({error:"Invalid Password"},{status:400})
    }

    const tokenData = {
        id:user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone:user.phone,
        email:user.email,
    }

    // Set token to expire in 30 days
    const token = jwt.sign(tokenData,process.env.JWT_SECRET!,{expiresIn:"30d"})
    
    const response = NextResponse.json({
      message:"Login Successful",
      success:true,
      username:user.firstName
    },{status:200})
    
    // Set cookie to expire in 30 days
    response.cookies.set('token', token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: "/",
    });
    
    return response;
  } catch (error:any) {
    return NextResponse.json(
      {message:"An error occured during login. Please try again later."},
      {status:500}
    )
  }
}
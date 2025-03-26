import {NextRequest,NextResponse} from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/app/lib/db';
import jwt from 'jsonwebtoken';
import {sendEmail} from '@/app/helper/mailer';

export async function POST(request:NextRequest){
   try {
    await connectToDatabase();
    const reqBody = await request.json();
    const email = reqBody.email;
    console.log("Email:",reqBody.email);
    const user = await User.findOne({email:email});
    if(!user){
        return NextResponse.json({message:"User does not exist"},{status:404})
    }
    const tokenData = {
        id:user._id,
        username:user.firstName,
        email:user.email
    }
    const token = jwt.sign(tokenData,process.env.JWT_SECRET!,{expiresIn : "1h"});
    user.forgotPasswordToken = token;
    user.forgotPasswordTokenExpiration = Date.now() + 3600000;
    const savedUser = await user.save();
    await sendEmail(savedUser.email,"FORGOT",savedUser._id);
    return NextResponse.json({message:"Token generated successfully"},{status:200})
   } catch (error) {
    return NextResponse.json({message:"An error occured during resetting password. Please try again later."},{status:500})
   }
}
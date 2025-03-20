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
      console.log(reqBody)

      const user = await User.findOne({email:email})
      if(!user){
          toast.error("User does not exist");
          return NextResponse.json({error:"User does not exist"},{status:500})
      }
      const validPassword = await bcryptjs.compare(password,user.password)
      if(!validPassword){
          return NextResponse.json({error:"Invalid Password"},{status:400})
      }
    //   if(!user.isVerified){
    //         return NextResponse.json({error:"Your email is not verified. Please verify your email to proceed."},{status:400})
    //     }
      const tokenData = {
          id:user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone:user.phone,
          email:user.email,
      }

      const token = jwt.sign(tokenData,process.env.JWT_SECRET!,{expiresIn:"1h"})
      
      const response = NextResponse.json({message:"Login Successful",success:true,username:user.firstName},{status:200})
      response.cookies.set('token',token)
      return response;
  } catch (error:any) {
      return NextResponse.json({message:"An error occured duing login. Please try again later."},{status:500})
  }
}
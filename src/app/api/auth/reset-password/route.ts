import User from '@/models/User';
import {NextResponse,NextRequest} from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request:NextRequest){
    try {
        const reqBody = await request.json();
        const {token,password} = reqBody;
        console.log(reqBody);
        if(!password || !token){
            return NextResponse.json({error:"Invalid token"},{status:400})
        }

        const user = await User.findOne({
            forgotPasswordToken:token,
            forgotPasswordTokenExpiration:{$gt:Date.now()}
        })

        if(!user){
            return NextResponse.json({error:"Invalid or expired token"},{status:400})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        user.password = hashedPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiration = undefined;

        await user.save();
        return NextResponse.json({message:"Password reset successfully"},{status:200})
    }
    catch (error) {
        return NextResponse.json({message:"An error occured during resetting password. Please try again later."},{status:500})
    }
}
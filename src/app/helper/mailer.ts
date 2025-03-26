import nodemailer from 'nodemailer';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async (email: string, emailType: string, userId: string) => {
   try {
    const token = await bcrypt.hash(userId.toString(), 12);
    
    // Update user with appropriate token based on email type
    if(emailType === "VERIFY") {
        await User.findOneAndUpdate({_id: userId}, {
            verificationToken: token,
            verificationTokenExpiration: Date.now() + 3600000 // 1 hour
        });
    } else if(emailType === "FORGOT") {
        await User.findOneAndUpdate({_id: userId}, {
            forgotPasswordToken: token,
            forgotPasswordTokenExpiration: Date.now() + 3600000 // 1 hour
        });
    }

    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS
        },
        logger: true,
    });

    const user = await User.findById(userId);

    const mailOptions = {
        from: `MindEase Support <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: emailType === "VERIFY" 
            ? "Verify Your MindEase Account" 
            : "Reset Your MindEase Password",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${emailType === "VERIFY" ? "Account Verification" : "Password Reset"} | MindEase</title>
                <style>
                    body, html {
                        margin: 0;
                        padding: 0;
                        font-family: 'Arial', sans-serif;
                        background-color: #f8f9fa;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 30px 20px;
                        text-align: center;
                        color: white;
                    }
                    .logo {
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .tagline {
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 30px;
                        text-align: center;
                    }
                    h1 {
                        color: #4a5568;
                        margin-bottom: 20px;
                        font-size: 24px;
                    }
                    p {
                        color: #4a5568;
                        line-height: 1.6;
                        margin-bottom: 20px;
                        font-size: 16px;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 14px 28px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 16px;
                        margin: 20px 0;
                        transition: transform 0.2s ease;
                    }
                    .button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        font-size: 14px;
                        color: #718096;
                        border-top: 1px solid #e2e8f0;
                    }
                    .disclaimer {
                        font-size: 12px;
                        color: #a0aec0;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">MindEase</div>
                        <div class="tagline">Your journey to mental wellness</div>
                    </div>
                    <div class="content">
                        <h1>${emailType === "VERIFY" 
                            ? "Welcome to MindEase" 
                            : "Password Reset Request"}
                        </h1>
                        
                        <p>Hello ${user?.firstName || 'there'},</p>
                        
                        <p>${emailType === "VERIFY" 
                            ? "Thank you for joining MindEase, your companion in mental wellness. To get started, please verify your email address to complete your registration." 
                            : "We received a request to reset your MindEase account password. Your mental health journey is important to us, and we're here to help you regain access to your account."
                        }</p>
                        
                        <a href="${process.env.NEXTAUTH_URL}/${emailType === 'VERIFY' ? `verify-email?token=${token}` : `reset-password?token=${token}`}" 
                           class="button">
                            ${emailType === 'VERIFY' ? 'Verify Email' : 'Reset Password'}
                        </a>
                        
                        <p>${emailType === "VERIFY" 
                            ? "If you didn't create an account with MindEase, you can safely ignore this email." 
                            : "If you didn't request this password reset, no further action is required. Your account remains secure."
                        }</p>
                        
                        <p class="disclaimer">
                            For your security, this link will expire in 1 hour.<br>
                            MindEase will never ask for your password outside of our secure platform.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} MindEase. All rights reserved.</p>
                        <p>Supporting your mental wellness journey every step of the way</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
   } catch (error: any) {
        console.error('Error sending email:', error.message);
        return NextResponse.json(
            { error: 'Failed to send email' }, 
            { status: 500 }
        );
   }    
}
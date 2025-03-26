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
                        font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                        background-color: #f5f7fa;
                        color: #333;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.07);
                    }
                    .header {
                        background: #6366f1;
                        padding: 35px 20px;
                        text-align: center;
                        color: white;
                        position: relative;
                    }
                    .header::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 6px;
                        background: linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef);
                    }
                    .logo {
                        font-size: 32px;
                        font-weight: bold;
                        margin-bottom: 12px;
                        letter-spacing: -0.5px;
                    }
                    .tagline {
                        font-size: 16px;
                        opacity: 0.95;
                        font-weight: 300;
                        letter-spacing: 0.3px;
                    }
                    .content {
                        padding: 40px 30px;
                        text-align: center;
                        background-color: #fff;
                        background-image: radial-gradient(#f1f5f9 1px, transparent 1px);
                        background-size: 25px 25px;
                        background-position: -10px -10px;
                    }
                    .message-box {
                        background-color: white;
                        border-radius: 12px;
                        padding: 25px;
                        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.03);
                        margin-bottom: 25px;
                    }
                    h1 {
                        color: #1e293b;
                        margin-bottom: 24px;
                        font-size: 26px;
                        font-weight: 600;
                    }
                    p {
                        color: #475569;
                        line-height: 1.7;
                        margin-bottom: 20px;
                        font-size: 16px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: 500;
                        color: #334155;
                        margin-bottom: 16px;
                    }
                    .button {
                        display: inline-block;
                        background: #6366f1;
                        color: white;
                        padding: 15px 32px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        margin: 25px 0;
                        transition: all 0.2s ease;
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                    }
                    .button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
                    }
                    .divider {
                        height: 1px;
                        background-color: #e2e8f0;
                        margin: 30px 0;
                    }
                    .footer {
                        background-color: #f8fafc;
                        padding: 25px 20px;
                        text-align: center;
                        font-size: 14px;
                        color: #64748b;
                        border-top: 1px solid #e2e8f0;
                    }
                    .disclaimer {
                        font-size: 13px;
                        color: #94a3b8;
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #f8fafc;
                        border-radius: 8px;
                        border-left: 3px solid #cbd5e1;
                    }
                    .social-links {
                        margin: 15px 0;
                    }
                    .social-links a {
                        display: inline-block;
                        margin: 0 8px;
                        color: #64748b;
                        text-decoration: none;
                    }
                    .social-links a:hover {
                        color: #6366f1;
                    }
                    .footer-logo {
                        font-weight: bold;
                        color: #334155;
                        font-size: 16px;
                        margin-bottom: 5px;
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
                        <div class="message-box">
                            <h1>${emailType === "VERIFY" 
                                ? "Welcome to MindEase" 
                                : "Password Reset Request"}
                            </h1>
                            
                            <p class="greeting">Hello ${user?.firstName || 'there'},</p>
                            
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
                        </div>
                        
                        <div class="disclaimer">
                            For your security, this link will expire in 1 hour.<br>
                            MindEase will never ask for your password outside of our secure platform.
                        </div>
                    </div>
                    <div class="footer">
                        <div class="footer-logo">MindEase</div>
                        <p>Supporting your mental wellness journey every step of the way</p>
                        <div class="social-links">
                            <a href="#">Twitter</a> • 
                            <a href="#">Instagram</a> • 
                            <a href="#">Facebook</a>
                        </div>
                        <div class="divider"></div>
                        <p>© ${new Date().getFullYear()} MindEase. All rights reserved.</p>
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
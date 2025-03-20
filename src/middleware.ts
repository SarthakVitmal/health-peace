import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('token')?.value;
    const isPrivatePath = path.startsWith('/dashboard');
    const isAuthPath = ['/', '/login', '/signup', '/verifyemail'].includes(path);

    let tokenData = null;

    if (token) {
        try {
            tokenData = jwt.decode(token);
        } catch (error) {
            console.error("Invalid token:", error);
        }
    }

    // Redirect unauthenticated users from private pages
    if (isPrivatePath && !tokenData) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect logged-in users away from authentication pages
    if (isAuthPath && tokenData) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/', 
        '/login', 
        '/signup', 
        '/verifyemail', 
        '/dashboard/:path*', 
        '/forgotpassword', 
        '/resetpassword'
    ],
};

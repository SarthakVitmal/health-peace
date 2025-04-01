import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define private and authentication paths
    const isPrivatePath = path.startsWith('/dashboard');
    const isAuthPath = ['/', '/login', '/signup', '/verifyemail'].includes(path);

    // Get the session token using next-auth/jwt
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Check for the custom token (for normal login)
    const customToken = request.cookies.get('token')?.value;

    // Determine if the user is authenticated
    const isAuthenticated = !!token || !!customToken;

    // Redirect unauthenticated users from private pages
    if (isPrivatePath && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect logged-in users away from authentication pages
    if (isAuthPath && isAuthenticated) {
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
        '/resetpassword',
        '/terms',
        '/privacy-policy',
    ],
};


import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define private and authentication paths
    const isPrivatePath = path.startsWith('/dashboard');
    const isAuthPath = ['/', '/login', '/signup', '/verifyemail'].includes(path);

    try {
        // Get the session token using next-auth/jwt
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

        // Check for the custom token (for normal login)
        const customToken = request.cookies.get('token')?.value;

        // Determine if the user is authenticated
        const isAuthenticated = !!token || !!customToken;

        // Handle server restart case - check for auth cookies first
        const hasAuthCookies = request.cookies.get('next-auth.session-token') || 
                              request.cookies.get('__Secure-next-auth.session-token') || 
                              customToken;

        // Redirect unauthenticated users from private pages
        if (isPrivatePath && !isAuthenticated) {
            // If they have auth cookies but token verification failed (server restart case)
            if (hasAuthCookies) {
                // Force a logout by clearing cookies
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('next-auth.session-token');
                response.cookies.delete('__Secure-next-auth.session-token');
                response.cookies.delete('token');
                return response;
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Redirect logged-in users away from authentication pages
        if (isAuthPath && (isAuthenticated || hasAuthCookies)) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        // In case of error, proceed with the request but clear potentially invalid tokens
        const response = NextResponse.next();
        response.cookies.delete('next-auth.session-token');
        response.cookies.delete('__Secure-next-auth.session-token');
        response.cookies.delete('token');
        return response;
    }
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
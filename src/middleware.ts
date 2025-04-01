import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Predefined paths for better maintainability
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/verifyemail',
  '/forgotpassword',
  '/resetpassword',
  '/terms',
  '/privacy-policy'
]);

const PRIVATE_PREFIX = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivatePath = pathname.startsWith(PRIVATE_PREFIX);
  const isPublicPath = PUBLIC_PATHS.has(pathname);

  // Only proceed with auth check if necessary
  if (!isPrivatePath && !isPublicPath) {
    return NextResponse.next();
  }

  try {
    // Parallel token fetching for better performance
    const [nextAuthToken, customToken] = await Promise.all([
      getToken({ req: request, secret: process.env.NEXTAUTH_SECRET! }),
      request.cookies.get('token')?.value
    ]);

    const isAuthenticated = !!nextAuthToken || !!customToken;

    // Redirect rules
    if (isPrivatePath && !isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isPublicPath && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    console.error('Middleware error:', error);
    // Fallback for token verification errors
    if (isPrivatePath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth.js routes)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
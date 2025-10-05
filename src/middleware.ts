
import { NextResponse, type NextRequest } from 'next/server';

// List of routes that are protected and require authentication.
const protectedRoutes = [
  '/profile',
  '/orders',
  '/checkout',
  '/onboarding',
  '/kyc',
  '/barter',
  '/notifications',
  '/seller',
  '/transactions',
  '/admin',
];

async function getSessionStatus(request: NextRequest) {
  const url = new URL('/api/auth/session-status', request.url);
  try {
    const response = await fetch(url, {
      headers: {
        'Cookie': request.headers.get('Cookie') || '',
      },
    });
    if (response.ok) {
      return await response.json();
    }
    return { isAuthenticated: false, onboardingComplete: false };
  } catch (error) {
    console.error("Error fetching session status:", error);
    return { isAuthenticated: false, onboardingComplete: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, etc.
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.endsWith('.ico') || pathname.endsWith('.png')) {
    return NextResponse.next();
  }

  const { isAuthenticated, onboardingComplete } = await getSessionStatus(request);
  const isAuthPage = pathname === '/auth';

  if (isAuthenticated) {
    // If the user is authenticated but hasn't completed onboarding,
    // force them to the onboarding page, unless they are already there.
    if (!onboardingComplete && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // If the user is authenticated and onboarding is complete,
    // they should not be able to access the auth page.
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // If the user is not authenticated, they can only access public routes.
    // All other routes are protected.
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api/auth/session-status (the session status check itself)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth/session-status|_next/static|_next/image|favicon.ico).*)',
  ],
};

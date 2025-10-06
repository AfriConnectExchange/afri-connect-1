
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
  '/seller', // This will protect all sub-routes like /seller/dashboard
  '/transactions',
  '/admin',
];

// Asynchronously fetch session status from our own API route.
async function getSessionStatus(request: NextRequest) {
  // We construct an absolute URL to our API route.
  const url = new URL('/api/auth/session-status', request.url);
  try {
    // We forward the cookies from the incoming request to our API route.
    // This is crucial for the API to determine the auth state.
    const response = await fetch(url, {
      headers: {
        'Cookie': request.headers.get('Cookie') || '',
      },
    });
    if (response.ok) {
      return await response.json();
    }
    // If the API call fails, assume not authenticated.
    return { isAuthenticated: false, onboardingComplete: false };
  } catch (error) {
    console.error("Middleware Error: Failed to fetch session status.", error);
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
  const isAuthPage = pathname.startsWith('/auth');

  if (isAuthenticated) {
    // If authenticated but onboarding is not complete, force redirect to onboarding.
    // Allow access only to the onboarding page itself or sign-out API.
    if (!onboardingComplete && pathname !== '/onboarding') {
       return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // If authenticated and onboarded, user should not see the auth page.
    // Redirect them to the main marketplace.
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // If not authenticated, check if the route is protected.
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (isProtectedRoute) {
      // Redirect to the auth page if trying to access a protected route.
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // If none of the above conditions are met, proceed with the request.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api/auth/session-status (the session status check itself to prevent loops)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth/session-status|_next/static|_next/image|favicon.ico).*)',
  ],
};

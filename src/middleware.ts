import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // This is a placeholder for your actual session cookie name from Firebase Auth
  const hasAuthCookie = request.cookies.has('__session');

  const isAuthPage = pathname === '/';
  
  if (isAuthPage) {
    if (hasAuthCookie) {
      return NextResponse.redirect(new URL('/marketplace', request.url))
    }
    return NextResponse.next()
  }

  if (!hasAuthCookie && pathname !== '/') {
    // You might want to allow access to other public pages here
    const publicPaths = ['/marketplace', '/product', '/forgot-password', '/auth/reset-password'];
    if (publicPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api (API routes)
     * - auth/callback (auth callbacks)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.png$).*)',
  ],
}

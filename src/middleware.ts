import { NextResponse, type NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // For now, we'll just return the next response.
  // We can add auth-based redirects here later.
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
    '/((?!_next/static|_next/image|api|auth/|favicon.ico|.*\\.png$).*)',
  ],
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define public and authentication routes
  const publicRoutes = ['/']; // The root is the only public page (login/signup)
  const authRoutes = ['/auth/callback', '/auth/reset-password', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If the user is logged in
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    const isOnboardingComplete = profile?.onboarding_completed || false

    // If onboarding is not complete, and they are not on the onboarding page, redirect them.
    if (!isOnboardingComplete && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // If onboarding is complete, and they try to access a public/auth page, redirect them to the marketplace.
    if (isOnboardingComplete && (isPublicRoute || pathname === '/onboarding')) {
      return NextResponse.redirect(new URL('/marketplace', request.url))
    }
  } else {
    // If the user is not logged in and trying to access any route that isn't public or an auth utility route
    if (!isPublicRoute && !isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/marketplace' // Redirect to marketplace on successful login
  const origin = searchParams.get('origin')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
        // Use the origin from searchParams if it exists, otherwise use a default
        const redirectUrl = origin ? `${origin}${next}` : next;
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // return the user to an error page with instructions
  const errorRedirectUrl = origin ? `${origin}/auth/auth-code-error` : '/auth/auth-code-error';
  return NextResponse.redirect(new URL(errorRedirectUrl, request.url));
}

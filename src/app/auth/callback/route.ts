import { NextResponse } from 'next/server';
// This route is not used in the Firebase Auth + Supabase DB setup.
// It can be removed or left for future use with Supabase Auth.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(origin);
}

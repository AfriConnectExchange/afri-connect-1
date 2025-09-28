import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // This route is now primarily for handling OAuth callbacks from Firebase.
  // The actual session management and profile creation logic is best handled 
  // on the client-side after the redirect from the OAuth provider.
  
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') ?? '/';
  
  // The Firebase client SDK will handle the session persistence.
  // We just redirect the user to their intended destination.
  // If it's a new user, client-side logic will redirect to onboarding.
  return NextResponse.redirect(`${origin}${next}`);
}

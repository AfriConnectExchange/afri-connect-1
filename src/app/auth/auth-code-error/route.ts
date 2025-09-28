import { NextResponse } from 'next/server'

// This route is used when there is an error exchanging an auth code for a session.
// It is used in the /auth/callback route.
export async function GET() {
  return NextResponse.json(
    { error: 'Server error', message: 'Something went wrong. Please try again.' },
    { status: 500 }
  )
}

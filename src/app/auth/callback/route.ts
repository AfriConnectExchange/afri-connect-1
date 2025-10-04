
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // This is a placeholder for now. We will implement the Firebase logic here.
  // For now, redirect to the homepage.
  return NextResponse.redirect(new URL('/', request.url));
}

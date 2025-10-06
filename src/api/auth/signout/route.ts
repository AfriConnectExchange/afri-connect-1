
import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  // Clear the session cookie used by Firebase Admin verification
  res.cookies.set('__session', '', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 });
  return res;
}

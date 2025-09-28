import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { provider } = await request.json();
  console.log(`Logging in user via ${provider}`);
  return NextResponse.json({ success: true, userId: 'USER-456', token: 'fake-jwt-token-social', message: 'Login successful.' });
}

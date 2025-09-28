import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, verificationType } = await request.json();
  console.log(`Starting ${verificationType} verification for user ${userId}`);
  return NextResponse.json({ success: true, message: 'Verification process initiated.' });
}

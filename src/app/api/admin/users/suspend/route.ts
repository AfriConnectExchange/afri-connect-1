import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, reason } = await request.json();
  console.log(`Suspending user ${userId} for: ${reason}`);
  return NextResponse.json({ success: true, message: `User ${userId} has been suspended.` });
}

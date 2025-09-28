import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { reviewId } = await request.json();
  console.log(`Replying to review ${reviewId}`);
  return NextResponse.json({ success: true, message: 'Reply posted.' });
}

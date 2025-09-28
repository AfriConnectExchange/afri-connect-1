import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { reviewId, action, reason } = await request.json();
  console.log(`Moderating review ${reviewId} with action: ${action}`);
  return NextResponse.json({ success: true, message: `Review ${reviewId} has been ${action}.` });
}

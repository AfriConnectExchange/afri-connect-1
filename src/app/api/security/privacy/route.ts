import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId } = await request.json();
  console.log(`Updating privacy settings for user ${userId}`);
  return NextResponse.json({ success: true, message: 'Privacy settings updated.' });
}

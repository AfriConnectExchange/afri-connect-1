import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, courseId } = await request.json();
  console.log(`Updating progress for user ${userId} in course ${courseId}`);
  return NextResponse.json({ success: true, message: 'Progress updated.' });
}

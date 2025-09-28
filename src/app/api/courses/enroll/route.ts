import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, courseId } = await request.json();
  console.log(`Enrolling user ${userId} in course ${courseId}`);
  return NextResponse.json({ success: true, message: 'Successfully enrolled in the course.' });
}

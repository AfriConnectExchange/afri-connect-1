import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, courseId } = await request.json();
  console.log(`Generating certificate for user ${userId} and course ${courseId}`);
  return NextResponse.json({
    certificateUrl: 'https://example.com/cert.pdf',
    userName: 'A. User',
    courseName: 'Digital Marketing for SMEs',
    completionDate: new Date().toLocaleDateString(),
  });
}

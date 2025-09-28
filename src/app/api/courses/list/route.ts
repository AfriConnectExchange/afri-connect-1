import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Fetching list of courses.');
  return NextResponse.json([
    { id: 'COURSE-1', title: 'Digital Marketing for SMEs', instructor: 'Jane Doe', duration: '4 weeks', price: 99 },
    { id: 'COURSE-2', title: 'Introduction to E-commerce', instructor: 'John Smith', duration: '2 weeks', price: 49 },
  ]);
}

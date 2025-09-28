import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { subject } = await request.json();
  console.log('Received contact form submission:', subject);
  return NextResponse.json({ success: true, message: 'Your message has been received. We will get back to you shortly.' });
}

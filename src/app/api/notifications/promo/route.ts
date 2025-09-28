import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const notification = await request.json();
  console.log(`Sending promo notification to ${notification.userId}: "${notification.title}"`);
  return NextResponse.json({ success: true, message: 'Notification sent successfully.' });
}

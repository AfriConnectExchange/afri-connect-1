import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { sessionId } = await request.json();
  console.log('Escalating chat to a human agent for session:', sessionId);
  return NextResponse.json({ success: true, message: 'A support agent will be with you shortly.' });
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();
  console.log(`Chatbot received message: "${message}"`);
  const reply = "I'm a placeholder bot! For real help, we'd need a more powerful AI model. Do you want to escalate?";
  const escalationRequired = message.toLowerCase().includes('human');
  return NextResponse.json({ reply, escalationRequired });
}

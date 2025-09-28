import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { advertId, action, reason } = await request.json();
  console.log(`Moderating advert ${advertId} with action: ${action}`);
  return NextResponse.json({ success: true, message: `Advert ${advertId} has been ${action}.` });
}

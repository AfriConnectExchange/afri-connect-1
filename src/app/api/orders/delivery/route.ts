import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { orderId, status } = await request.json();
  console.log(`Adding delivery event to order ${orderId}: ${status}`);
  return NextResponse.json({ success: true });
}

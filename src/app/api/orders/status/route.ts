import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { orderId, status } = await request.json();
  console.log(`Updating order ${orderId} status to ${status}`);
  return NextResponse.json({ success: true });
}

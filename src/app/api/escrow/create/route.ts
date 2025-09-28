import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { orderId } = await request.json();
  const escrowId = `ESC-${Date.now()}`;
  console.log('Creating escrow for order:', orderId);
  return NextResponse.json({ success: true, message: 'Escrow created.', data: { escrowId } });
}

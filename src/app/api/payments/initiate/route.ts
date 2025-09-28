import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { orderId } = await request.json();
  console.log('Initiating payment for order:', orderId);
  return NextResponse.json({ success: true, message: 'Payment intent created.', data: { clientSecret: 'pi_123_secret_456' } });
}

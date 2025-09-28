import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { transactionId } = await request.json();
  console.log('Confirming payment:', transactionId);
  return NextResponse.json({ success: true, message: 'Payment confirmed.' });
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { amount, currency, provider } = await request.json();
  const transactionId = `REM-${Date.now()}`;
  console.log(`Sending ${amount} ${currency} via ${provider}`);
  return NextResponse.json({ success: true, message: 'Remittance initiated successfully.', transactionId });
}

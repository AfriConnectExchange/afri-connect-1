import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { transactionId, recipientId } = await request.json();
  console.log(`Recipient ${recipientId} is claiming transaction ${transactionId}`);
  return NextResponse.json({ success: true, message: 'Remittance claimed.' });
}

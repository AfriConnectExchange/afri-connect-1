import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { escrowId, releaseTo } = await request.json();
  console.log('Releasing escrow:', escrowId);
  return NextResponse.json({ success: true, message: `Escrow released to ${releaseTo}.` });
}

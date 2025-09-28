import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { targetProductId } = await request.json();
  const proposalId = `BARTER-${Date.now()}`;
  console.log('Barter proposed for product:', targetProductId);
  return NextResponse.json({ success: true, message: 'Barter proposal sent.', data: { proposalId } });
}

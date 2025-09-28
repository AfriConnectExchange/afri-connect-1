import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { sellerId } = await request.json();
  const reviewId = `SELLREV-${Date.now()}`;
  console.log(`Submitting review for seller ${sellerId}`);
  return NextResponse.json({ success: true, message: 'Seller review submitted.', reviewId });
}

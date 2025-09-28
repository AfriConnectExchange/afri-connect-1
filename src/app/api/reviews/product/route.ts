import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { productId } = await request.json();
  const reviewId = `PRODREV-${Date.now()}`;
  console.log(`Submitting review for product ${productId}`);
  return NextResponse.json({ success: true, message: 'Product review submitted.', reviewId });
}

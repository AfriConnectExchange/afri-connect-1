
import { NextResponse } from 'next/server';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  sellerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be 1000 characters or less'),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validation = reviewSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  // Logic to create review would go here

  return NextResponse.json({ success: true, message: 'Review submitted successfully.' });
}

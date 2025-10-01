import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  sellerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be 1000 characters or less'),
});

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = reviewSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { productId, orderId, sellerId, rating, comment } = validation.data;

  // 1. Verify user purchased this product via this order
  const { data: orderItem, error: orderItemError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('order_id', orderId)
    .eq('product_id', productId)
    .eq('order.buyer_id', user.id)
    .single();

  if (orderItemError || !orderItem) {
    return NextResponse.json({ error: 'Purchase not verified. You can only review products you have bought.' }, { status: 403 });
  }

  // 2. Verify a review for this order doesn't already exist
  const { data: existingReview, error: existingReviewError } = await supabase
    .from('reviews')
    .select('id')
    .eq('order_id', orderId)
    .single();

  if (existingReview) {
    return NextResponse.json({ error: 'You have already submitted a review for this purchase.' }, { status: 409 });
  }

  // 3. Insert the new review
  const { data: newReview, error: insertError } = await supabase
    .from('reviews')
    .insert({
      order_id: orderId,
      reviewer_id: user.id,
      reviewee_id: sellerId,
      product_id: productId,
      rating,
      comment,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating review:', insertError);
    return NextResponse.json({ error: 'Failed to submit review.', details: insertError.message }, { status: 500 });
  }

  // 4. Update the product's average rating and review count
  // This is a great candidate for a database function/trigger for atomicity
  const { error: updateError } = await supabase.rpc('update_product_rating', {
    prod_id: productId,
  });

  if (updateError) {
    // Log the error, but don't fail the request as the review was already created
    console.error('Failed to update product rating:', updateError);
  }

  return NextResponse.json({ success: true, message: 'Review submitted successfully.', review: newReview });
}

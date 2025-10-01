import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:reviewer_id ( full_name ),
      order:order_id ( buyer_id )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  // Map data to the frontend Review interface
  const mappedData = data.map(r => ({
    id: r.id,
    reviewer_name: r.reviewer.full_name || 'Anonymous',
    rating: r.rating,
    created_at: r.created_at,
    comment: r.comment,
    verified_purchase: !!r.order, // A review is verified if it's linked to an order
  }));

  return NextResponse.json(mappedData);
}

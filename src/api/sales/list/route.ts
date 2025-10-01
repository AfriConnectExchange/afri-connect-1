
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find all orders that contain at least one item sold by the current user
  const { data, error } = await supabase
    .from('orders')
    .select(`
        id,
        created_at,
        total_amount,
        status,
        buyer:profiles!buyer_id ( full_name ),
        order_items!inner (
            product_id,
            product:products ( seller_id )
        )
    `)
    .eq('order_items.product.seller_id', user.id)
    .order('created_at', { ascending: false });


  if (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales.', details: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

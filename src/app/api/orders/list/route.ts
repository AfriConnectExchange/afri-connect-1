
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
        id,
        created_at,
        total_amount,
        status,
        order_items (
            product:products ( title, images )
        )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });


  if (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.', details: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

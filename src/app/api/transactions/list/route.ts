
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('transactions')
    .select(`
        *,
        order:order_id (
          order_items (
            product:products ( title )
          )
        )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions.', details: error.message }, { status: 500 });
  }

  // Enhance transaction data with a better description
  const mappedData = data.map(tx => ({
    ...tx,
    description: tx.order_id 
        ? tx.order.order_items.map((oi: any) => oi.product.title).join(', ')
        : tx.type.charAt(0).toUpperCase() + tx.type.slice(1) // Fallback description
  }));


  return NextResponse.json(mappedData);
}


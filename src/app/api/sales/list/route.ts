
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // This is the correct way to fetch sales for a specific seller using a database function.
  // The function 'get_sales_for_seller' needs to be created in the Supabase SQL Editor.
  const { data, error } = await supabase
    .rpc('get_sales_for_seller', { p_seller_id: user.id })
    .select(`
        id,
        created_at,
        total_amount,
        status,
        buyer:profiles!buyer_id ( full_name )
    `)
    .order('created_at', { ascending: false });


  if (error) {
    console.error('Error fetching sales via RPC:', error);
    return NextResponse.json({ error: 'Failed to fetch sales.', details: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

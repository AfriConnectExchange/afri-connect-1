
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
    .rpc('get_sales_for_seller', { p_seller_id: user.id });
    
  if (error) {
    console.error('Error fetching sales via RPC:', error);
    return NextResponse.json({ error: 'Failed to fetch sales.', details: error.message }, { status: 500 });
  }

  // The RPC function should return data that is already structured correctly.
  // If not, you would map it here. For now, we assume the RPC returns the expected structure.
  
  // A more robust query within the RPC would be better, but if we need to join here:
  const orderIds = (data as any[] || []).map((d: any) => d.id);
  
  if (orderIds.length === 0) {
    return NextResponse.json([]);
  }
  
  const { data: finalData, error: finalError } = await supabase
    .from('orders')
    .select(`
        id,
        created_at,
        total_amount,
        status,
        buyer:profiles!buyer_id ( full_name )
    `)
    .in('id', orderIds)
    .order('created_at', { ascending: false });

  if (finalError) {
    console.error('Error fetching final sales data:', finalError);
    return NextResponse.json({ error: 'Failed to fetch final sales data.', details: finalError.message }, { status: 500 });
  }


  return NextResponse.json(finalData);
}

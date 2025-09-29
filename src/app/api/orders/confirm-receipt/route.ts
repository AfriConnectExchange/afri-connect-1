
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const confirmReceiptSchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = confirmReceiptSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { orderId } = validation.data;
  
  // Verify the current user is the buyer for this order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('buyer_id')
    .eq('id', orderId)
    .single();

  if (fetchError || !order || order.buyer_id !== user.id) {
    return NextResponse.json({ error: 'Order not found or you are not the buyer.' }, { status: 403 });
  }
  
  // Update order status to 'delivered'
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      actual_delivery_date: new Date().toISOString(), // Assumes this column exists
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error confirming receipt:', updateError);
    return NextResponse.json({ error: 'Failed to update order status.', details: updateError.message }, { status: 500 });
  }
  
  // In a real application, this is where you would trigger the escrow release to the seller.
  // For now, we just update the status.
  
  // You would also create a notification for the seller here

  return NextResponse.json({ success: true, message: 'Order receipt confirmed. Payment will be released to the seller.' });
}

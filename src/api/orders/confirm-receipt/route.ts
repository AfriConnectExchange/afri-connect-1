
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logSystemEvent } from '@/lib/system-logger';

const confirmReceiptSchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const origin = request.headers.get('origin');

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = confirmReceiptSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { orderId } = validation.data;
  
  // 1. Verify the current user is the buyer for this order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('buyer_id, seller_id, total_amount')
    .eq('id', orderId)
    .single();

  if (fetchError || !order || order.buyer_id !== user.id) {
    return NextResponse.json({ error: 'Order not found or you are not the buyer.' }, { status: 403 });
  }
  
  // 2. Update order status to 'delivered'
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      actual_delivery_date: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error confirming receipt:', updateError);
     await logSystemEvent(user, {
      type: 'order_confirmation',
      status: 'failure',
      description: `Failed to confirm receipt for order ${orderId}`,
      order_id: orderId,
      metadata: { error: updateError.message },
    });
    return NextResponse.json({ error: 'Failed to update order status.', details: updateError.message }, { status: 500 });
  }

  await logSystemEvent(user, {
    type: 'order_confirmation',
    status: 'success',
    amount: parseFloat(order.total_amount),
    description: `Buyer confirmed receipt for order ${orderId}`,
    order_id: orderId,
    metadata: { seller_id: order.seller_id },
  });
  
  // 3. Trigger the escrow release to the seller.
  // This is a server-to-server call for security.
  const escrowReleaseResponse = await fetch(`${origin}/api/escrow/release`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '', // Forward cookies for authentication
      },
      body: JSON.stringify({ orderId: orderId }),
  });

  if (!escrowReleaseResponse.ok) {
    console.error('Escrow release failed:', await escrowReleaseResponse.text());
    // Even if escrow fails, the order is confirmed. The system should have a retry mechanism for payouts.
    // For now, we'll just log the error but still return success to the user.
  }
  
  // 4. Create a notification for the seller that the order is complete.
  if(order.seller_id) {
    await supabase.from('notifications').insert({
        user_id: order.seller_id,
        type: 'order',
        title: 'Order Completed!',
        message: `Order #${orderId.substring(0,8)} has been marked as delivered by the buyer.`,
        link_url: `/sales`
    });
  }


  return NextResponse.json({ success: true, message: 'Order receipt confirmed. Payment will be released to the seller.' });
}

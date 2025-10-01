
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logSystemEvent } from '@/lib/system-logger';

const releaseEscrowSchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = releaseEscrowSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { orderId } = validation.data;

  // 1. Verify the current user is the buyer for this order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('buyer_id, seller_id, total_amount') // Select seller_id and amount as well
    .eq('id', orderId)
    .single();

  if (orderError || !orderData || orderData.buyer_id !== user.id) {
    return NextResponse.json({ error: 'Order not found or you are not the buyer.' }, { status: 403 });
  }

  // 2. Update the escrow transaction status to 'released'
  const { data: escrowData, error: escrowError } = await supabase
    .from('escrow_transactions')
    .update({ 
        status: 'released',
        updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)
    .select()
    .single();

  if (escrowError) {
    console.error('Error releasing escrow:', escrowError);
     await logSystemEvent(user, {
      type: 'escrow_release',
      status: 'failure',
      amount: parseFloat(orderData.total_amount),
      description: `Failed to release escrow for order ${orderId}`,
      order_id: orderId,
      metadata: { error: escrowError.message },
    });
    return NextResponse.json({ error: 'Failed to release escrow payment.', details: escrowError.message }, { status: 500 });
  }

  // Log the successful escrow release
  await logSystemEvent(user, {
    type: 'escrow_release',
    status: 'success',
    amount: parseFloat(orderData.total_amount),
    description: `Escrow released to seller for order ${orderId}`,
    order_id: orderId,
    metadata: { escrow_id: escrowData.id, seller_id: orderData.seller_id },
  });


  // 3. (Future step) This is where you would trigger a payout to the seller's connected account.
  // For now, we'll create a notification for the seller.
  
  if(orderData.seller_id) {
      await supabase.from('notifications').insert({
          user_id: orderData.seller_id,
          type: 'payment',
          title: 'Funds Released!',
          message: `Funds for order #${orderId.substring(0,8)} have been released and are on their way to you.`,
          link_url: '/sales'
      });
  }


  return NextResponse.json({ success: true, message: `Escrow released for order ${orderId}.`, data: escrowData });
}

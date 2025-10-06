
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { logSystemEvent } from '@/lib/system-logger';

const createEscrowSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().positive(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = createEscrowSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { order_id, amount } = validation.data;

  // Verify the user is the buyer for this order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('buyer_id')
    .eq('id', order_id)
    .single();

  if (orderError || !orderData || orderData.buyer_id !== user.id) {
    return NextResponse.json({ error: 'Order not found or you are not the buyer.' }, { status: 403 });
  }

  const { data: escrowData, error: escrowError } = await supabase
    .from('escrow_transactions')
    .insert({
      order_id,
      amount,
      status: 'funded', // Initial status when created
    })
    .select()
    .single();

  if (escrowError) {
    console.error('Error creating escrow:', escrowError);
    await logSystemEvent(user, {
      type: 'escrow_creation',
      status: 'failure',
      amount: amount,
      description: `Failed to create escrow for order ${order_id}`,
      order_id: order_id,
      metadata: { error: escrowError.message },
    });
    return NextResponse.json({ error: 'Failed to create escrow transaction.', details: escrowError.message }, { status: 500 });
  }

  // Log the successful escrow creation
  await logSystemEvent(user, {
    type: 'escrow_creation',
    status: 'success',
    amount: amount,
    description: `Escrow funded for order ${order_id}`,
    order_id: order_id,
    metadata: { escrow_id: escrowData.id },
  });


  // Optionally, update the order status to 'in_escrow'
  await supabase
    .from('orders')
    .update({ status: 'processing' }) // Assuming 'processing' means it's in escrow
    .eq('id', order_id);

  return NextResponse.json({ success: true, message: 'Escrow created and funded successfully.', data: escrowData });
}

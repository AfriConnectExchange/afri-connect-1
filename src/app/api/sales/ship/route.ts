
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const shipOrderSchema = z.object({
  orderId: z.string().uuid(),
  courierName: z.string().min(2),
  trackingNumber: z.string().min(5),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = shipOrderSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { orderId, courierName, trackingNumber } = validation.data;
  
  // TODO: Verify that the current user is the seller for this order before updating.
  // This is a critical security check missing for now.

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'shipped',
      courier_name: courierName, // Assumes courier_name column exists
      tracking_number: trackingNumber,
    })
    .eq('id', orderId);

  if (error) {
    console.error('Error shipping order:', error);
    return NextResponse.json({ error: 'Failed to update order status.', details: error.message }, { status: 500 });
  }
  
  // You would also create a notification for the buyer here

  return NextResponse.json({ success: true, message: 'Order has been marked as shipped.' });
}


import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const shipOrderSchema = z.object({
  orderId: z.string().uuid(),
  courierName: z.string().min(2, 'Courier name is required.'),
  trackingNumber: z.string().min(5, 'Tracking number seems too short.'),
});

// --- Mock Logistics API ---
// In a real application, this would be an SDK call to Shippo, AfterShip, etc.
async function verifyTrackingNumber(courier: string, trackingNumber: string): Promise<{ success: boolean; message: string; }> {
    console.log(`Verifying tracking number ${trackingNumber} with ${courier}...`);
    
    // Simulate some latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock logic: For demonstration, let's say any number containing "INVALID" fails.
    if (trackingNumber.toUpperCase().includes('INVALID')) {
        return { success: false, message: 'This tracking number is not valid with the selected courier.' };
    }
    
    // Simulate success
    return { success: true, message: 'Tracking number verified.' };
}


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
  
  // Security Check: Verify that the current user is the seller for this order.
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('buyer_id, order_items(seller_id)')
    .eq('id', orderId)
    .single();

  if (orderError || !orderData) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const isSellerForOrder = orderData.order_items.some((item: any) => item.seller_id === user.id);
  
  if (!isSellerForOrder) {
      return NextResponse.json({ error: 'You are not authorized to ship this order.' }, { status: 403 });
  }

  // Step 1: Verify the tracking number with the mock logistics API
  const verificationResult = await verifyTrackingNumber(courierName, trackingNumber);

  if (!verificationResult.success) {
      return NextResponse.json({ error: verificationResult.message }, { status: 400 });
  }

  // Step 2: If verification is successful, update the order in the database
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'shipped',
      courier_name: courierName,
      tracking_number: trackingNumber,
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error shipping order:', updateError);
    return NextResponse.json({ error: 'Failed to update order status.', details: updateError.message }, { status: 500 });
  }
  
  // Step 3: Create a notification for the buyer
  if (orderData?.buyer_id) {
    await supabase.from('notifications').insert({
        user_id: orderData.buyer_id,
        type: 'delivery',
        title: 'Your Order is on its way!',
        message: `Your order #${orderId.substring(0,8)} has been shipped via ${courierName}. Tracking: ${trackingNumber}`,
        link_url: `/tracking?orderId=${orderId}`
    });
  }


  return NextResponse.json({ success: true, message: 'Order has been marked as shipped.' });
}


import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// This schema now includes seller_id, which is crucial for the order_items table
const orderItemSchema = z.object({
  id: z.string(),
  quantity: z.number().int().positive(),
  price: z.number(),
  seller_id: z.string(), // Added seller_id
});

const createOrderSchema = z.object({
  cartItems: z.array(orderItemSchema),
  subtotal: z.number(),
  deliveryFee: z.number(),
  total: z.number(),
  paymentMethod: z.string(),
  shippingAddress: z.object({
      street: z.string(),
      city: z.string(),
      postcode: z.string(),
      phone: z.string(),
  })
});

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = createOrderSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { cartItems, total, paymentMethod, shippingAddress } = validation.data;

  try {
    // In a real application, you would wrap this in a database transaction (e.g., via an RPC call)
    // to ensure all operations succeed or fail together.

    // 1. Create an 'orders' record
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: total,
        currency: 'GBP', // Assuming GBP for now
        status: 'processing', // Default status
        payment_method: paymentMethod,
        shipping_address: shippingAddress as any, // Cast for simplicity, ensure your type matches DB
      })
      .select()
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    // 2. Create 'order_items' records
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
      seller_id: item.seller_id, // Including seller_id as per schema
    }));
    
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (orderItemsError) {
        // Attempt to roll back the order creation if items fail
        await supabase.from('orders').delete().eq('id', orderData.id);
        throw new Error(`Failed to create order items: ${orderItemsError.message}`);
    }

    // 3. Update product stock (decrement quantity_available)
    for (const item of cartItems) {
      const { error: stockUpdateError } = await supabase.rpc('decrement_product_quantity', {
          p_id: item.id,
          p_quantity: item.quantity
      });
      if (stockUpdateError) {
          console.warn(`Could not update stock for product ${item.id}: ${stockUpdateError.message}`);
          // Decide on rollback strategy. For now, we'll log a warning.
      }
    }

    // 4. Create a 'transactions' record (optional, but good practice)
    await supabase.from('transactions').insert({
        order_id: orderData.id,
        profile_id: user.id,
        type: 'purchase',
        amount: total,
        status: 'completed', // Assuming payment was successful before calling this API
        provider: paymentMethod,
    });


    return NextResponse.json({ success: true, message: 'Order created successfully', orderId: orderData.id, order: orderData });

  } catch (error: any) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'Order creation failed', details: error.message }, { status: 500 });
  }
}

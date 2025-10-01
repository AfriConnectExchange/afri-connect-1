
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// This schema now includes seller_id, which is crucial for the order_items table
const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number(),
  seller_id: z.string().uuid(),
});

const createOrderSchema = z.object({
  cartItems: z.array(orderItemSchema),
  subtotal: z.number(),
  deliveryFee: z.number(),
  total: z.number(),
  paymentMethod: z.string(), // Now accepts more generic 'online'
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
    // Return detailed validation errors
    console.error('Order validation failed:', validation.error.flatten());
    return NextResponse.json({
        error: 'Invalid input data provided.',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { cartItems, total, paymentMethod, shippingAddress } = validation.data;

  try {
    // In a real application, you would wrap this in a database transaction (e.g., via an RPC call)
    // to ensure all operations succeed or fail together.

    // 0. Pre-flight check: Verify stock for all items
    for (const item of cartItems) {
      const { data: product, error } = await supabase
        .from('products')
        .select('quantity_available, title')
        .eq('id', item.product_id)
        .single();
      
      if (error || !product) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }
      if (product.quantity_available < item.quantity) {
        throw new Error(`Not enough stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.quantity_available}.`);
      }
    }


    // 1. Create an 'orders' record
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: total,
        currency: 'GBP', // Assuming GBP for now
        status: 'processing', // Default status
        payment_method: paymentMethod, // Store generic payment method
        shipping_address: shippingAddress, // Store address object directly now
      })
      .select()
      .single();

    if (orderError) {
      console.error('Supabase order creation error:', orderError);
      // Throw the detailed Supabase error to be caught by the catch block
      throw new Error(`Order creation error: ${orderError.message} (Code: ${orderError.code})`);
    }
    
    if (!orderData) {
        throw new Error('Order creation did not return the expected data.');
    }


    // 2. Create 'order_items' records
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price,
      seller_id: item.seller_id,
    }));
    
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (orderItemsError) {
        // Attempt to roll back the order creation if items fail
        console.error('Supabase order items creation error:', orderItemsError);
        await supabase.from('orders').delete().eq('id', orderData.id);
        throw new Error(`Order items creation error: ${orderItemsError.message} (Code: ${orderItemsError.code})`);
    }

    // 3. Update product stock (decrement quantity_available)
    for (const item of cartItems) {
      const { error: stockUpdateError } = await supabase.rpc('decrement_product_quantity', {
          p_id: item.product_id,
          p_quantity: item.quantity
      });
      if (stockUpdateError) {
          console.warn(`Could not update stock for product ${item.product_id}: ${stockUpdateError.message}`);
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
        provider: paymentMethod, // Store the specific payment method here
    });
    
    // 5. Create notifications for seller(s)
    const sellerIds = [...new Set(cartItems.map(item => item.seller_id))];
    for (const sellerId of sellerIds) {
        if (sellerId === user.id) continue; // Don't notify user of their own purchase from themself
        
        await supabase.from('notifications').insert({
            user_id: sellerId,
            type: 'order',
            title: 'New Sale!',
            message: `You have a new order #${orderData.id.substring(0, 8)} from ${user.user_metadata.full_name || 'a buyer'}.`,
            link_url: '/sales'
        });
    }
    
    // 6. Create notification for buyer
    await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'order',
        title: 'Order Confirmed!',
        message: `Your order #${orderData.id.substring(0, 8)} for £${total.toFixed(2)} has been confirmed.`,
        link_url: `/tracking?orderId=${orderData.id}`
    });


    return NextResponse.json({ success: true, message: 'Order created successfully', orderId: orderData.id, order: orderData });

  } catch (error: any) {
    // This will now catch detailed errors from above
    console.error('Full order creation failed:', error.message);
    return NextResponse.json(
      {
        error: 'Order Creation Failed',
        // Send the specific error message to the client
        details: error.message,
      },
      { status: 500 }
    );
  }
}
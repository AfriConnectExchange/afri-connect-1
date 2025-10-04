
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

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
  paymentMethod: z.string(),
  shippingAddress: z.object({
      street: z.string(),
      city: z.string(),
      postcode: z.string(),
      phone: z.string(),
  })
});

// Function to send a message via the Twilio extension
async function sendSms(to: string, body: string) {
  if (!firestore) {
    console.error("Firestore not initialized for SMS service.");
    return;
  }
  await addDoc(collection(firestore, 'messages'), { to, body });
}


export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = createOrderSchema.safeParse(body);

  if (!validation.success) {
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
    // 1. Pre-flight check: Verify stock for all items
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

    // 2. Call the RPC function to create the order and its items atomically
    const { data: newOrderId, error: rpcError } = await supabase.rpc('create_order_with_items', {
        buyer_id_param: user.id,
        total_amount_param: total,
        payment_method_param: paymentMethod,
        shipping_address_param: shippingAddress,
        items: cartItems,
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      throw new Error(`Order creation RPC failed: ${rpcError.message}`);
    }
    
    if (!newOrderId) {
        throw new Error('Order creation RPC did not return an order ID.');
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
        order_id: newOrderId,
        profile_id: user.id,
        type: 'purchase',
        amount: total,
        status: 'completed',
        provider: paymentMethod,
    });
    
    // 5. Create notifications for seller(s) and send SMS
    const sellerIds = [...new Set(cartItems.map(item => item.seller_id))];
    for (const sellerId of sellerIds) {
        if (sellerId === user.id) continue;

        // Fetch seller profile to get their phone number
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('phone_number, full_name')
          .eq('id', sellerId)
          .single();
        
        await supabase.from('notifications').insert({
            user_id: sellerId,
            type: 'order',
            title: 'New Sale!',
            message: `You have a new order #${String(newOrderId).substring(0, 8)} from ${user.user_metadata.full_name || 'a buyer'}.`,
            link_url: '/sales'
        });

        // ** NEW: Send SMS Notification via Twilio Extension **
        if (sellerProfile && sellerProfile.phone_number) {
            const smsBody = `AfriConnect: New Sale! You have an order for £${total.toFixed(2)} from ${user.user_metadata.full_name || 'a buyer'}. Order ID: #${String(newOrderId).substring(0, 8)}.`;
            await sendSms(sellerProfile.phone_number, smsBody);
        }
    }
    
    // 6. Create notification for buyer
    await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'order',
        title: 'Order Confirmed!',
        message: `Your order #${String(newOrderId).substring(0, 8)} for £${total.toFixed(2)} has been confirmed.`,
        link_url: `/tracking?orderId=${newOrderId}`
    });


    return NextResponse.json({ success: true, message: 'Order created successfully', orderId: newOrderId });

  } catch (error: any) {
    console.error('Full order creation failed:', error.message);
    return NextResponse.json(
      {
        error: 'Order Creation Failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

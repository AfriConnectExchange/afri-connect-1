'use server';
import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';

// Make sure to install stripe: npm install stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const headersList = headers();
  const { cartItems } = await req.json();
  
  const origin = headersList.get('origin') || 'http://localhost:9002';

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
  }

  try {
    const line_items = cartItems.map((item: any) => {
      return {
        price_data: {
          currency: 'gbp', // Use GBP as per our app's standard
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: {
                productId: item.id,
                sellerId: item.seller_id,
            }
          },
          unit_amount: Math.round(item.price * 100), // Price in pence
        },
        quantity: item.quantity,
      };
    });

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?status=cancelled`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });

  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

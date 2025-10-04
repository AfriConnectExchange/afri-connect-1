
import { NextResponse } from 'next/server';
import { z } from 'zod';

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

export async function POST(request: Request) {
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

  // Logic to create order would go here

  return NextResponse.json({ success: true, message: 'Order created successfully' });
}

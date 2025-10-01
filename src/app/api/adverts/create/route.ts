
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Define the schema for the product data
const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.number().min(0, 'Price must be a positive number.'),
  category_id: z.coerce.number().int().positive('Please select a category.'),
  listing_type: z.enum(['sale', 'barter', 'freebie']),
  location_text: z.string().min(3, 'Please provide a location.'),
  quantity_available: z.number().int().min(1, 'Quantity must be at least 1.'),
  images: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
  shipping_policy: z.record(z.any()).optional(),
});


export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const validation = productSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const {
      title,
      description,
      price,
      category_id,
      listing_type,
      location_text,
      quantity_available,
      images,
      specifications,
      shipping_policy
  } = validation.data;

  const { data: productData, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      category_id,
      listing_type,
      location_text,
      quantity_available,
      images,
      specifications,
      shipping_policy,
      currency: 'GBP', // Default currency
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Advert created successfully.', product: productData });
}

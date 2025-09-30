import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const productSchema = z.object({
  id: z.string().uuid(), // ID is required for editing
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.number().min(0, 'Price must be a positive number.'),
  category_id: z.coerce.number().int().positive('Please select a category.'),
  listing_type: z.enum(['sale', 'barter', 'freebie']),
  location_text: z.string().min(3, 'Please provide a location.'),
  quantity_available: z.number().int().min(1, 'Quantity must be at least 1.'),
  images: z.array(z.string().url()).optional(),
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
      id,
      title,
      description,
      price,
      category_id,
      listing_type,
      location_text,
      quantity_available,
      images
  } = validation.data;

  // Verify the user owns the product before updating
  const { data: existingProduct, error: fetchError } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (fetchError || !existingProduct) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  if (existingProduct.seller_id !== user.id) {
    return NextResponse.json({ error: 'You do not have permission to edit this product.' }, { status: 403 });
  }

  const { data: productData, error } = await supabase
    .from('products')
    .update({
      title,
      description,
      price,
      category_id,
      listing_type,
      location_text,
      quantity_available,
      images,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Advert updated successfully.', product: productData });
}

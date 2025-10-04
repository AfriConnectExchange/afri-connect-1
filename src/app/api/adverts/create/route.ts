
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Define the schema for the product data
const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.number().min(0, 'Price must be a positive number.'),
  category_id: z.coerce.number().int().positive('Please select a category.'),
  listing_type: z.enum(['sale', 'barter', 'freebie']),
  location_text: z.string().min(3, 'Please provide a location.'),
  quantity_available: z.number().int().min(1, 'Quantity must be at least 1.'),
  images: z.array(z.string().url()).min(1, "At least one image is required."),
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
  
  const { images, ...productData } = validation.data;

  // In a real app, you would upload the base64 images to a storage service like Supabase Storage
  // and get back the public URLs. For now, we'll just log that we received them.
  console.log(`Received ${images.length} images to process.`);
  
  // For this example, let's pretend we uploaded them and got URLs
  const imageUrls = images.map((_, index) => `https://placehold.co/600x600?text=Image+${index+1}`);


  const { data: newProduct, error } = await supabase
    .from('products')
    .insert({
      ...productData,
      seller_id: user.id,
      images: imageUrls,
    })
    .select()
    .single();
    
   if (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product.', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Advert created successfully.', data: newProduct });
}


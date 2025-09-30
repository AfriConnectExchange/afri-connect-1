import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const deleteSchema = z.object({
  productId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = deleteSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { productId } = validation.data;

  // Verify the user owns the product before deleting
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', productId)
    .single();

  if (fetchError || !product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  if (product.seller_id !== user.id) {
    return NextResponse.json({ error: 'You do not have permission to delete this product.' }, { status: 403 });
  }
  
  // Proceed with deletion
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (deleteError) {
    console.error('Error deleting product:', deleteError);
    return NextResponse.json({ error: 'Failed to delete product.', details: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
}

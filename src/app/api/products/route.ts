'use server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles ( full_name, kyc_status ),
      category:categories ( name )
    `)
    .eq('status', 'active');

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  // Map fetched data to the frontend Product interface
  const mappedProducts = productsData.map((p: any) => ({
    ...p,
    name: p.title,
    image: p.images?.[0] || 'https://placehold.co/400x300', // fallback image
    seller: p.seller?.full_name || 'Unknown Seller',
    sellerVerified: p.seller?.kyc_status === 'verified',
    category: p.category?.name || 'Uncategorized',
    isFree: p.listing_type === 'freebie' || p.price === 0,
    // Mocking these for now, as they are not in the schema yet
    rating: 4.5, 
    reviews: 10,
  }));

  return NextResponse.json(mappedProducts);
}

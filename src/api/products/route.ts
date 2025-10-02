
'use server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');
  const categoryName = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const isFree = searchParams.get('isFree');
  const verified = searchParams.get('verified');
  const sortBy = searchParams.get('sortBy') || 'created_at_desc';
  const limit = searchParams.get('limit');

  let query = supabase
    .from('products')
    .select(`
      *,
      seller:profiles ( full_name, kyc_status ),
      category:categories ( name )
    `, { count: 'exact' })
    .eq('status', 'active');

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }
  
  if (categoryName && categoryName !== 'all') {
    const { data: categoryData } = await supabase.from('categories').select('id').eq('name', categoryName).single();
    if(categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  if (minPrice) {
    query = query.gte('price', Number(minPrice));
  }
  if (maxPrice) {
    query = query.lte('price', Number(maxPrice));
  }
  if (isFree === 'true') {
    query = query.eq('listing_type', 'freebie');
  }
  if (verified === 'true') {
    query = query.eq('seller.kyc_status', 'verified');
  }
  
  if (sortBy) {
    const [sortField, sortOrder] = sortBy.split('_');
    if (sortField && sortOrder) {
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    } else {
        query = query.order('created_at', { ascending: false });
    }
  }
  
  if (limit) {
    query = query.limit(Number(limit));
  }


  const { data: productsData, error: productsError, count } = await query;
  
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
    stockCount: p.quantity_available,
    rating: p.average_rating || 0,
    reviews: p.review_count || 0,
  }));

  return NextResponse.json({ products: mappedProducts, total: count });
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories ( name )
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to frontend structure
  const mappedData = data.map((p: any) => ({
      ...p,
      name: p.title,
      image: p.images?.[0] || 'https://placehold.co/400x300',
      category: p.category?.name || 'Uncategorized',
      isFree: p.listing_type === 'freebie' || p.price === 0,
      stockCount: p.quantity_available,
      rating: 4.5, // Mock
      reviews: 10, // Mock
  }))

  return NextResponse.json(mappedData);
}

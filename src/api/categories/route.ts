
'use server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name');

  if (categoriesError) {
    return NextResponse.json({ error: categoriesError.message }, { status: 500 });
  }

  // Fetch all products to calculate counts
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('category_id');

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  // Calculate the count for each category
  const mappedCategories = categoriesData.map((c: any) => ({
    ...c,
    count: productsData?.filter(p => p.category_id === c.id).length || 0,
  }));

  const allCategories = [
    { id: 'all', name: 'All Categories', count: productsData?.length || 0 },
    ...mappedCategories,
  ];

  return NextResponse.json(allCategories);
}

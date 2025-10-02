'use server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  // Call the new RPC function to get categories with counts efficiently
  const { data, error } = await supabase.rpc('get_categories_with_product_counts');

  if (error) {
    console.error('Error fetching categories with counts:', error);
    return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
  }
  
  // The RPC function result includes the total count for the "All" category.
  const allCategory = data.find((c: any) => c.id === null);
  const otherCategories = data.filter((c: any) => c.id !== null);

  const allCategoriesData = [
    { id: 'all', name: 'All Categories', count: allCategory ? allCategory.product_count : 0 },
    ...otherCategories.map((c: any) => ({
      id: c.id,
      name: c.name,
      count: c.product_count,
    })),
  ];

  return NextResponse.json(allCategoriesData);
}

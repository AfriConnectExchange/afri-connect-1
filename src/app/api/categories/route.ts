
'use server';
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin-utils';

export async function GET() {
  try {
    const firestore = await getAdminFirestore();
    const categoriesSnap = await firestore.collection('categories').orderBy('name').get();
    const categoriesData = categoriesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Fetch all products to calculate counts in-memory.
    // This is not scalable for large product sets. For production,
    // this count should be maintained with triggers or aggregated periodically.
    const productsSnap = await firestore.collection('products').select('category_id').get();
    const productCounts = new Map<string, number>();

    productsSnap.forEach(doc => {
      const categoryId = doc.data().category_id;
      if (categoryId) {
        productCounts.set(categoryId, (productCounts.get(categoryId) || 0) + 1);
      }
    });

    const mappedCategories = categoriesData.map(c => ({
      ...c,
      count: productCounts.get(c.id) || 0,
    }));

    const allCategories = [
      { id: 'all', name: 'All Categories', count: productsSnap.size },
      ...mappedCategories,
    ];

    return NextResponse.json(allCategories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

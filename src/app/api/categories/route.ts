
'use server';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.PROJECT_ID,
  clientEmail: process.env.CLIENT_EMAIL,
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
    try {
        initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e) {
        console.error('Firebase Admin initialization error', e);
    }
}


export async function GET() {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }
  const adminFirestore = getFirestore();

  try {
    const categoriesSnap = await adminFirestore.collection('categories').orderBy('name').get();
    const categoriesData = categoriesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    const productsSnap = await adminFirestore.collection('products').select('category_id').get();
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
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json([]);
  }
}

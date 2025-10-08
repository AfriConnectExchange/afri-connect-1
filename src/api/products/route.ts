
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
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
        initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e) {
        console.error('Firebase Admin initialization error', e);
    }
  }
}

export async function GET(request: Request) {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }
  const adminFirestore = getFirestore();
  
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q');
    const categoryName = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isFree = searchParams.get('isFree');
    const verified = searchParams.get('verified');
    const sortBy = searchParams.get('sortBy') || 'created_at_desc';
    const limit = searchParams.get('limit');

    let query: any = adminFirestore.collection('products').where('status', '==', 'active');
    
    if (minPrice) {
      query = query.where('price', '>=', Number(minPrice));
    }
    if (maxPrice) {
      query = query.where('price', '<=', Number(maxPrice));
    }
    if (isFree === 'true') {
      query = query.where('listing_type', '==', 'freebie');
    }
    
    const [sortField, sortOrder] = sortBy.split('_');
    if (sortField && sortOrder) {
        query = query.orderBy(sortField, sortOrder as 'asc' | 'desc');
    } else {
        query = query.orderBy('created_at', 'desc');
    }
    
    if (limit) {
      query = query.limit(Number(limit));
    }

    const productsSnapshot = await query.get();
    let productsData = productsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    
    if (q) {
        const lowerQ = q.toLowerCase();
        productsData = productsData.filter((p: any) => 
          p.title.toLowerCase().includes(lowerQ) || 
          p.description.toLowerCase().includes(lowerQ)
        );
    }

    if (categoryName && categoryName !== 'all') {
      const categoriesSnapshot = await adminFirestore.collection('categories').where('name', '==', categoryName).get();
      if (!categoriesSnapshot.empty) {
          const categoryId = categoriesSnapshot.docs[0].id;
          productsData = productsData.filter((p: any) => p.category_id === categoryId);
      } else {
          productsData = [];
      }
    }
    
    const mappedProductsPromises = productsData.map(async (p: any) => {
      let sellerName = 'Unknown Seller';
      let kycStatus = 'unverified';
      let sellerLatLon = null;
      if(p.seller_id) {
        try {
            const sellerDoc = await adminFirestore.collection('profiles').doc(p.seller_id).get();
            if(sellerDoc.exists) {
            const sellerData = sellerDoc.data();
            sellerName = sellerData?.full_name || 'Unknown Seller';
            kycStatus = sellerData?.kyc_status || 'unverified';
            sellerLatLon = sellerData?.latlng || null;
            }
        } catch(e) {
            // Seller not found, continue
        }
      }
      
      let categoryNameStr = 'Uncategorized';
      if (p.category_id) {
          try {
            const categoryDoc = await adminFirestore.collection('categories').doc(String(p.category_id)).get();
            if(categoryDoc.exists) {
                categoryNameStr = categoryDoc.data()?.name || 'Uncategorized';
            }
          } catch(e) {
              // Category not found, continue
          }
      }

      return {
        ...p,
        name: p.title,
        image: p.images?.[0] || 'https://placehold.co/400x300',
        seller: sellerName,
        sellerVerified: kycStatus === 'verified',
        category: categoryNameStr,
        isFree: p.listing_type === 'freebie' || p.price === 0,
        stockCount: p.quantity_available,
        rating: p.average_rating || 0,
        reviews: p.review_count || 0,
        latlng: sellerLatLon,
      }
    });

    let mappedProducts = await Promise.all(mappedProductsPromises);
    
    if (verified === 'true') {
        mappedProducts = mappedProducts.filter(p => p.sellerVerified);
    }

    return NextResponse.json({ products: mappedProducts, total: mappedProducts.length });
  } catch(error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ products: [], total: 0 });
  }
}

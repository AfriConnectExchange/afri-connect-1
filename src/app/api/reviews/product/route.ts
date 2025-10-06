
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.project_id,
  clientEmail: process.env.client_email,
  privateKey: process.env.private_key?.replace(/\\n/g, '\n'),
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
  } else {
      console.log('Firebase Admin SDK service account credentials not set.');
  }
}

export async function GET(request: Request) {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }
  const adminFirestore = getFirestore();

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const reviewsQuery = adminFirestore.collection('reviews').where('product_id', '==', productId).orderBy('created_at', 'desc');
    const reviewsSnapshot = await reviewsQuery.get();
    
    const reviewsPromises = reviewsSnapshot.docs.map(async (doc) => {
        const reviewData = doc.data();
        let reviewerName = 'Anonymous';

        if(reviewData.reviewer_id) {
            const reviewerDoc = await adminFirestore.collection('profiles').doc(reviewData.reviewer_id).get();
            if(reviewerDoc.exists) {
                reviewerName = reviewerDoc.data()?.full_name || 'Anonymous';
            }
        }
        
        return {
            id: doc.id,
            reviewer_name: reviewerName,
            rating: reviewData.rating,
            created_at: reviewData.created_at,
            comment: reviewData.comment,
            verified_purchase: !!reviewData.order_id,
        };
    });

    const mappedData = await Promise.all(reviewsPromises);

    return NextResponse.json(mappedData);

  } catch(error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

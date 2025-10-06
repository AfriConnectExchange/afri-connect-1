
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

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


const reviewSchema = z.object({
  productId: z.string(),
  orderId: z.string(),
  sellerId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be 1000 characters or less'),
});

export async function POST(request: Request) {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }
  const adminAuth = getAuth();
  const adminFirestore = getFirestore();
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const user = await adminAuth.getUser(decodedToken.uid);
  
    const body = await request.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { productId, orderId, sellerId, rating, comment } = validation.data;

    // 1. Verify user purchased this product via this order
    const orderItemsQuery = await adminFirestore.collection('orders').doc(orderId).collection('order_items').where('product_id', '==', productId).get();

    if (orderItemsQuery.empty) {
      return NextResponse.json({ error: 'Purchase not verified. You can only review products you have bought.' }, { status: 403 });
    }

    // 2. Verify a review for this order item doesn't already exist
    const existingReviewQuery = await adminFirestore.collection('reviews')
        .where('order_id', '==', orderId)
        .where('product_id', '==', productId)
        .where('reviewer_id', '==', user.uid)
        .get();

    if (!existingReviewQuery.empty) {
      return NextResponse.json({ error: 'You have already submitted a review for this purchase.' }, { status: 409 });
    }

    // 3. Insert the new review
    const newReviewRef = await adminFirestore.collection('reviews').add({
      order_id: orderId,
      reviewer_id: user.uid,
      reviewee_id: sellerId,
      product_id: productId,
      rating,
      comment,
      created_at: new Date().toISOString(),
    });

    // 4. Update the product's average rating and review count
    const productRef = adminFirestore.collection('products').doc(productId);
    await adminFirestore.runTransaction(async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) {
            throw "Product not found";
        }
        const productData = productDoc.data()!;
        const newReviewCount = (productData.review_count || 0) + 1;
        const newAverageRating = ((productData.average_rating || 0) * (newReviewCount - 1) + rating) / newReviewCount;
        
        transaction.update(productRef, {
            review_count: newReviewCount,
            average_rating: newAverageRating,
        });
    });


    return NextResponse.json({ success: true, message: 'Review submitted successfully.', reviewId: newReviewRef.id });

  } catch (error: any) {
    console.error('Error creating review:', error);
    if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to submit review.', details: error.message }, { status: 500 });
  }
}

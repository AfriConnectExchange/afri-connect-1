import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
  }
}


export async function GET(request: Request) {
  if (!serviceAccount) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }

  if (!getApps().length) {
    console.error('Firebase admin app is not initialized.');
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }

  const adminAuth = getAuth();
  const adminFirestore = getFirestore();

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

  const ordersSnapshot = await adminFirestore.collection('orders').where('seller_id', '==', userId).get();
    
  const sales = await Promise.all(ordersSnapshot.docs.map(async (orderDoc) => {
    const orderData = orderDoc.data() as any;
    const buyerDoc = await adminFirestore.collection('profiles').doc(orderData.buyer_id).get();
    const buyerName = buyerDoc.exists ? (buyerDoc.data() as any)?.full_name : 'Unknown Buyer';
        
    return {
      id: orderDoc.id,
      created_at: orderData.created_at,
      total_amount: orderData.total,
      status: orderData.status,
      buyer: {
        full_name: buyerName,
      }
    }
  }));
    
    return NextResponse.json(sales.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales data.' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!getApps().length && serviceAccount) {
  initializeApp({
    credential: {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    },
  });
}

const adminAuth = serviceAccount ? getAuth() : null;
const adminFirestore = serviceAccount ? getFirestore() : null;

export async function GET(request: Request) {
  if (!adminAuth || !adminFirestore) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }

  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const productsQuery = query(collection(adminFirestore, 'products'), where('seller_id', '==', userId));
    const querySnapshot = await getDocs(productsQuery);
    
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json(products);

  } catch (error) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
  }
}

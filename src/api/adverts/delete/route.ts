'use server';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

// Accept multiple env name patterns so existing .env works
const PROJECT_ID = process.env.PROJECT_ID || process.env.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL || process.env.client_email || process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY || process.env.private_key || process.env.FIREBASE_PRIVATE_KEY;
const PRIVATE_KEY = PRIVATE_KEY_RAW ? PRIVATE_KEY_RAW.replace(/\\n/g, '\n') : undefined;

const serviceAccount = {
  projectId: PROJECT_ID,
  clientEmail: CLIENT_EMAIL,
  privateKey: PRIVATE_KEY,
};

if (!getApps().length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      initializeApp({ credential: cert(serviceAccount) });
    } catch (e) {
      console.error('Firebase Admin initialization error', e);
    }
  } else {
    console.warn('Firebase Admin SDK credentials not fully set; adverts delete API will return 500 until configured.');
  }
}

export async function POST(request: Request) {
  if (!getApps().length) return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });

  try {
  const adminAuth = getAuth();
  const adminFirestore = getFirestore();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId } = body;
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

    const docRef = adminFirestore.collection('products').doc(productId);
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const data: any = doc.data();
    if (data.seller_id !== decoded.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft-delete by marking status
    await docRef.update({ status: 'deleted' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete advert error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

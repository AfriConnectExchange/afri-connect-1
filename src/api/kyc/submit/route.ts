'use server';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

const PROJECT_ID = process.env.PROJECT_ID || process.env.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL || process.env.client_email || process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY || process.env.private_key || process.env.FIREBASE_PRIVATE_KEY;
const PRIVATE_KEY = PRIVATE_KEY_RAW ? PRIVATE_KEY_RAW.replace(/^"|"$/g, '').replace(/\\n/g, '\n') : undefined;

const serviceAccount = {
  projectId: PROJECT_ID,
  clientEmail: CLIENT_EMAIL,
  privateKey: PRIVATE_KEY,
};

if (!getApps().length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      const initOpts: any = { credential: cert(serviceAccount) };
      // try to set storageBucket if present
      const STORAGE_BUCKET = process.env.STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.firebase_storage_bucket;
      if (STORAGE_BUCKET) initOpts.storageBucket = STORAGE_BUCKET;
      initializeApp(initOpts);
    } catch (e) { console.error('Firebase Admin init failed', e); }
  } else {
    console.warn('Firebase Admin credentials not present for kyc submit route');
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminAuth = getAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { kycData, documents } = body; // documents: array of { id, name, url, status }

    const db = getFirestore();
    const uid = decoded.uid;
    const kycRef = db.collection('kyc').doc(uid);
    await kycRef.set({ kycData, documents, status: 'pending', submitted_at: new Date().toISOString() }, { merge: true });

    // Also merge into profiles collection for quick access
    const profilesRef = db.collection('profiles').doc(uid);
    await profilesRef.set({ kyc_status: 'pending', kyc_submitted_at: new Date().toISOString() }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('KYC submit error', error);
    return NextResponse.json({ error: error.message || 'Failed to submit KYC' }, { status: 500 });
  }
}

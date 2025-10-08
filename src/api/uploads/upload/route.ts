'use server';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

// Accept existing env names
const PROJECT_ID = process.env.PROJECT_ID || process.env.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL || process.env.client_email || process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY || process.env.private_key || process.env.FIREBASE_PRIVATE_KEY;
// strip surrounding quotes and fix newline escape sequences
const PRIVATE_KEY = PRIVATE_KEY_RAW ? PRIVATE_KEY_RAW.replace(/^"|"$/g, '').replace(/\\n/g, '\n') : undefined;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.firebase_storage_bucket;

const serviceAccount = {
  projectId: PROJECT_ID,
  clientEmail: CLIENT_EMAIL,
  privateKey: PRIVATE_KEY,
};

if (!getApps().length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      const initOpts: any = { credential: cert(serviceAccount) };
      if (STORAGE_BUCKET) initOpts.storageBucket = STORAGE_BUCKET;
      initializeApp(initOpts);
    } catch (e) { console.error('Firebase Admin init failed', e); }
  } else {
    console.warn('Firebase Admin credentials not present for uploads route');
  }
}

async function uploadDataUrlToBucket(dataUrl: string, filenameHint = 'upload') {
  const bucketName = STORAGE_BUCKET;
  if (!bucketName) throw new Error('No storage bucket configured');
  console.log('uploadDataUrlToBucket -> using bucket:', bucketName);
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid data URL');
  const mime = matches[1];
  const base64 = matches[2];
  const ext = mime.split('/')[1] || 'jpg';
  const buffer = Buffer.from(base64, 'base64');
  const filePath = `uploads/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${filenameHint}.${ext}`;
  const storage = getStorage();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);
  await file.save(buffer, { metadata: { contentType: mime } });
  try { await file.makePublic(); return `https://storage.googleapis.com/${bucketName}/${filePath}`; } catch { return `gs://${bucketName}/${filePath}`; }
}

export async function POST(request: Request) {
  if (!getApps().length) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  try {
    const adminAuth = getAuth();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl, filename } = body;
      if (!dataUrl) return NextResponse.json({ error: 'No dataUrl provided' }, { status: 400 });
      const url = await uploadDataUrlToBucket(dataUrl, filename || 'file');
      return NextResponse.json({ url });
    }

    // For multipart uploads we would parse the body; to keep this simple we only support dataUrl JSON for now.
    return NextResponse.json({ error: 'Unsupported content type; send application/json with dataUrl' }, { status: 400 });
  } catch (error: any) {
    console.error('Upload error', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

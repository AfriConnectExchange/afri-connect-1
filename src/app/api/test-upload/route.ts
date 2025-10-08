
'use server';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

const PROJECT_ID = process.env.PROJECT_ID || process.env.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL || process.env.client_email || process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY || process.env.private_key || process.env.FIREBASE_PRIVATE_KEY;
// sanitize quoted private key and escaped newlines
const PRIVATE_KEY = PRIVATE_KEY_RAW ? PRIVATE_KEY_RAW.replace(/^"|"$/g, '').replace(/\\n/g, '\n') : undefined;

// Prefer explicit STORAGE_BUCKET env var (matches .env), fallback to default project bucket name
const BUCKET_NAME = process.env.STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.appspot.com`;

const serviceAccount = {
  projectId: PROJECT_ID,
  clientEmail: CLIENT_EMAIL,
  privateKey: PRIVATE_KEY,
};

// Initialize Firebase Admin SDK
if (!getApps().length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      initializeApp({ 
        credential: cert(serviceAccount),
        storageBucket: BUCKET_NAME,
      });
      console.log('Firebase Admin SDK Initialized for Test Upload.');
    } catch (e) {
      console.error('Firebase Admin Test Upload initialization error', e);
    }
  } else {
    console.warn('Firebase Admin credentials not present for test upload route');
  }
}

export async function POST(request: Request) {
  console.log('Test Upload API endpoint hit.');

  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  }

  try {
  const adminAuth = getAuth();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized: No session cookie.' }, { status: 401 });
    }
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session cookie.' }, { status: 401 });
    }

    const { dataUrl, filename } = await request.json();
    if (!dataUrl) {
      return NextResponse.json({ error: 'No dataUrl provided' }, { status: 400 });
    }

    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Invalid data URL format.' }, { status: 400 });
    }
    const mime = matches[1];
    const base64 = matches[2];
    const ext = filename.split('.').pop() || 'jpg';
    const buffer = Buffer.from(base64, 'base64');
    
    const filePath = `test_uploads/${Date.now()}_${filename}`;
    
    console.log(`Attempting to upload to bucket: ${BUCKET_NAME}, path: ${filePath}`);

  const storage = getStorage();
  const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(filePath);
    
    await file.save(buffer, { metadata: { contentType: mime } });
    console.log(`File saved to ${filePath}`);
    try {
      await file.makePublic();
      const publicUrl = file.publicUrl();
      console.log(`File made public. URL: ${publicUrl}`);
      return NextResponse.json({ success: true, url: publicUrl });
    } catch (err) {
      try {
        const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
        return NextResponse.json({ success: true, url: signedUrl });
      } catch {
        return NextResponse.json({ success: true, url: `gs://${BUCKET_NAME}/${filePath}` });
      }
    }

  } catch (error: any) {
    console.error('Test Upload Error:', error);
    const errorMessage = error.message || 'An unknown error occurred during upload.';
    const errorDetails = error.errors ? JSON.stringify(error.errors) : 'No further details.';
    return NextResponse.json({ 
        error: 'Upload failed on the server.', 
        details: errorMessage,
        gcpError: errorDetails,
    }, { status: 500 });
  }
}

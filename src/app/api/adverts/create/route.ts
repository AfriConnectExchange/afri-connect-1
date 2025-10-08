'use server';
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Accept multiple env name patterns so we don't force changing existing .env files.
const PROJECT_ID = process.env.PROJECT_ID || process.env.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL || process.env.client_email || process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY || process.env.private_key || process.env.FIREBASE_PRIVATE_KEY;
const PRIVATE_KEY = PRIVATE_KEY_RAW ? PRIVATE_KEY_RAW.replace(/\\n/g, '\n') : undefined;
const BUCKET_NAME = `${PROJECT_ID}.appspot.com`;

const serviceAccount = {
  projectId: PROJECT_ID,
  clientEmail: CLIENT_EMAIL,
  privateKey: PRIVATE_KEY,
};

if (!getApps().length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      initializeApp({ 
          credential: cert(serviceAccount),
          storageBucket: BUCKET_NAME
    });
    } catch (e) {
      console.error('Firebase Admin initialization error', e);
    }
  } else {
    console.warn('Firebase Admin SDK credentials not fully set; adverts API will return 500 until configured.');
  }
}

const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.preprocess((v) => Number(v), z.number().min(0)),
  quantity_available: z.preprocess((v) => Number(v), z.number().int().min(1)),
  listing_type: z.enum(['sale', 'barter', 'freebie']).default('sale'),
  category_id: z.union([z.string(), z.number()]).optional().nullable(),
  images: z.array(z.string()).min(1),
  specifications: z.record(z.any()).optional(),
  shipping_policy: z.record(z.any()).optional(),
  location_text: z.string().optional(),
});

async function uploadImageToBucket(dataUrl: string, index: number) {
  if (!BUCKET_NAME) return null;
  try {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return null;
    const mime = matches[1];
    const base64 = matches[2];
    const ext = mime.split('/')[1] || 'jpg';
    const buffer = Buffer.from(base64, 'base64');
    const filePath = `products/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${index}.${ext}`;
    const storage = getStorage();
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(filePath);
    await file.save(buffer, { metadata: { contentType: mime } });
    try {
      await file.makePublic();
      return file.publicUrl();
    } catch (e) {
      return `gs://${BUCKET_NAME}/${filePath}`;
    }
  } catch (e) {
    console.error('Image upload failed', e);
    return null;
  }
}

export async function POST(request: Request) {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }

  try {
  const adminAuth = getAuth();
  const adminFirestore = getFirestore();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true).catch(() => null);
    if (!decodedToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userUid = decodedToken.uid;

    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const processedImages: string[] = [];
    for (let i = 0; i < data.images.length; i++) {
      const img = data.images[i];
      if (typeof img === 'string' && img.startsWith('data:')) {
        const uploaded = await uploadImageToBucket(img, i);
        if (uploaded) processedImages.push(uploaded);
        else processedImages.push(img);
      } else if (typeof img === 'string') {
        processedImages.push(img);
      }
    }

    const docRef = await adminFirestore.collection('products').add({
      title: data.title,
      description: data.description,
      price: Number(data.price) || 0,
      quantity_available: Number(data.quantity_available) || 1,
      listing_type: data.listing_type || 'sale',
      category_id: data.category_id || null,
      images: processedImages,
      specifications: data.specifications || {},
      shipping_policy: data.shipping_policy || {},
      location_text: data.location_text || '',
      seller_id: userUid,
      status: 'active',
  created_at: new Date().toISOString(),
      average_rating: 0,
      review_count: 0,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Create advert error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

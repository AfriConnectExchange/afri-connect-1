
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';


const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!getApps().length && serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
}


// Define the schema for the product data
const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  price: z.number().min(0, 'Price must be a positive number.'),
  category_id: z.coerce.number().int().positive('Please select a category.'),
  listing_type: z.enum(['sale', 'barter', 'freebie']),
  location_text: z.string().min(3, 'Please provide a location.'),
  quantity_available: z.number().int().min(1, 'Quantity must be at least 1.'),
  images: z.array(z.string().url()).min(1, "At least one image is required."),
  specifications: z.record(z.any()).optional(),
  shipping_policy: z.record(z.any()).optional(),
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
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { images, ...productData } = validation.data;

    // In a real app, you would upload the base64 images to a storage service like Firebase Storage
    // and get back the public URLs. For now, we'll just log that we received them.
    console.log(`Received ${images.length} images to process.`);
    
    // For this example, let's pretend we uploaded them and got URLs
    const imageUrls = images; // Using the URLs directly from the client for now


    const newProductRef = await adminFirestore.collection('products').add({
      ...productData,
      seller_id: user.uid,
      images: imageUrls,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      average_rating: 0,
      review_count: 0
    });
      
    return NextResponse.json({ success: true, message: 'Advert created successfully.', data: { id: newProductRef.id } });

  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create product.', details: error.message }, { status: 500 });
  }
}

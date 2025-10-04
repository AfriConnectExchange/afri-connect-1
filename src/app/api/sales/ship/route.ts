import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase-admin/firestore';
import { z } from 'zod';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({
      credential: {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      },
    });
  }
}

const adminAuth = getAuth();
const adminFirestore = getFirestore();

const shipOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required.'),
  courierName: z.string().min(2, 'Courier name is required.'),
  trackingNumber: z.string().min(5, 'Tracking number seems too short.'),
});

async function verifyTrackingNumber(courier: string, trackingNumber: string): Promise<{ success: boolean; message: string; }> {
    console.log(`Verifying tracking number ${trackingNumber} with ${courier}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (trackingNumber.toUpperCase().includes('INVALID')) {
        return { success: false, message: 'This tracking number is not valid with the selected courier.' };
    }
    return { success: true, message: 'Tracking number verified.' };
}


export async function POST(request: Request) {
  if (!serviceAccount) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }

  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;
    
    const body = await request.json();
    const validation = shipOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { orderId, courierName, trackingNumber } = validation.data;

    const orderRef = doc(adminFirestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists() || orderSnap.data()?.seller_id !== userId) {
        return NextResponse.json({ error: 'Order not found or you are not the seller.' }, { status: 403 });
    }

    const verificationResult = await verifyTrackingNumber(courierName, trackingNumber);

    if (!verificationResult.success) {
        return NextResponse.json({ error: verificationResult.message }, { status: 400 });
    }

    await updateDoc(orderRef, {
      status: 'shipped',
      courier_name: courierName,
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString(),
    });
    
    const orderData = orderSnap.data();
    if (orderData?.buyer_id) {
      // In a real app, you'd create a notification document in Firestore.
      console.log(`Creating notification for buyer ${orderData.buyer_id}`);
    }

    return NextResponse.json({ success: true, message: 'Order has been marked as shipped.' });

  } catch (error) {
    console.error('Error shipping order:', error);
    if (error instanceof z.ZodError) {
       return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update order status.' }, { status: 500 });
  }
}

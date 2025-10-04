import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase-admin/firestore';

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

export async function GET(request: Request) {
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

    const ordersQuery = query(collection(adminFirestore, 'orders'), where('seller_id', '==', userId));
    const querySnapshot = await getDocs(ordersQuery);
    
    const sales = await Promise.all(querySnapshot.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data();
        const buyerDoc = await getDoc(doc(adminFirestore, 'profiles', orderData.buyer_id));
        const buyerName = buyerDoc.exists() ? buyerDoc.data()?.full_name : 'Unknown Buyer';
        
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

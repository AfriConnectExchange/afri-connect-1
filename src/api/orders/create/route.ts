
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';


const serviceAccount = {
  projectId: process.env.PROJECT_ID,
  clientEmail: process.env.CLIENT_EMAIL,
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
        initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e) {
        console.error('Firebase Admin initialization error', e);
    }
  }
}


const orderItemSchema = z.object({
  product_id: z.string(),
  quantity: z.number().int().positive(),
  price: z.number(),
  seller_id: z.string(),
});

const createOrderSchema = z.object({
  cartItems: z.array(orderItemSchema),
  subtotal: z.number(),
  deliveryFee: z.number(),
  total: z.number(),
  paymentMethod: z.string(),
  shippingAddress: z.object({
      street: z.string(),
      city: z.string(),
      postcode: z.string(),
      phone: z.string(),
  })
});

// Function to send an SMS via the Twilio extension
async function sendSms(to: string, body: string) {
  if (!getApps().length) {
    console.error("Firestore not initialized for SMS service.");
    return;
  }
  const firestore = getFirestore();
  await addDoc(collection(firestore, 'messages'), { to, body });
}

// Function to send an Email via the Email extension
async function sendEmail(to: string, subject: string, html: string) {
  if (!getApps().length) {
    console.error("Firestore not initialized for Email service.");
    return;
  }
  const firestore = getFirestore();
  await addDoc(collection(firestore, 'mail'), {
    to: [to],
    message: { subject, html },
  });
}


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
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      console.error('Order validation failed:', validation.error.flatten());
      return NextResponse.json({
          error: 'Invalid input data provided.',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { cartItems, total, paymentMethod, shippingAddress } = validation.data;

    // Pre-flight check for stock
    for (const item of cartItems) {
      const productDoc = await adminFirestore.collection('products').doc(item.product_id).get();
      if (!productDoc.exists) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }
      const product = productDoc.data() as any;
      if (product.quantity_available < item.quantity) {
        throw new Error(`Not enough stock for "${product.title}". Requested: ${item.quantity}, Available: ${product.quantity_available}.`);
      }
    }

    // Create the order document
    const orderRef = await adminFirestore.collection('orders').add({
        buyer_id: user.uid,
        total_amount: total,
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        status: 'processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
    const newOrderId = orderRef.id;

    // Use a batch to create order items and update product stock atomically
    const batch = adminFirestore.batch();
    for (const item of cartItems) {
      const orderItemRef = adminFirestore.collection('orders').doc(newOrderId).collection('order_items').doc();
      batch.set(orderItemRef, {
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price,
        seller_id: item.seller_id,
      });

      const productRef = adminFirestore.collection('products').doc(item.product_id);
      const productDoc = await productRef.get();
      const currentQuantity = productDoc.data()?.quantity_available || 0;
      batch.update(productRef, { quantity_available: currentQuantity - item.quantity });
    }
    await batch.commit();

    // Log the transaction
    await adminFirestore.collection('transactions').add({
        order_id: newOrderId,
        profile_id: user.uid,
        type: 'purchase',
        amount: total,
        status: 'completed',
        provider: paymentMethod,
        created_at: new Date().toISOString(),
    });
    
    // --- NOTIFICATION LOGIC ---

    // 1. Notify Buyer (In-App and Email)
    const buyerName = user.displayName || 'customer';
    await adminFirestore.collection('notifications').add({
        user_id: user.uid,
        type: 'order',
        title: 'Order Confirmed!',
        message: `Your order #${String(newOrderId).substring(0, 8)} for £${total.toFixed(2)} has been confirmed.`,
        link_url: `/tracking?orderId=${newOrderId}`,
        read: false,
        created_at: new Date().toISOString(),
    });
    if (user.email) {
      await sendEmail(
        user.email,
        `Your AfriConnect Order #${String(newOrderId).substring(0, 8)} is Confirmed!`,
        `<h1>Thank you for your order, ${buyerName}!</h1><p>Your order with ID #${String(newOrderId).substring(0, 8)} has been placed successfully. We will notify you once it has been shipped.</p>`
      );
    }

    // 2. Notify Seller(s) (In-App, Email, and SMS)
    const sellerIds = [...new Set(cartItems.map(item => item.seller_id))];
    for (const sellerId of sellerIds) {
        if (sellerId === user.uid) continue; // Don't notify user if they bought their own item

        const sellerProfileDoc = await adminFirestore.collection('profiles').doc(sellerId).get();
        const sellerProfile = sellerProfileDoc.data();
        
        await adminFirestore.collection('notifications').add({
            user_id: sellerId,
            type: 'order',
            title: 'New Sale!',
            message: `You have a new order #${String(newOrderId).substring(0, 8)} from ${buyerName}.`,
            link_url: '/sales',
            read: false,
            created_at: new Date().toISOString(),
        });
        
        if (sellerProfile) {
            // Send Email to Seller
            if (sellerProfile.email) {
              await sendEmail(
                sellerProfile.email,
                `New Sale on AfriConnect! Order #${String(newOrderId).substring(0, 8)}`,
                `<h1>You have a new sale!</h1><p>Order ID: #${String(newOrderId).substring(0, 8)} from ${buyerName}. Please prepare the items for shipping.</p><p>Total: £${total.toFixed(2)}</p>`
              );
            }
            // Send SMS to Seller
            if (sellerProfile.phone_number) {
                const smsBody = `AfriConnect: New Sale! Order for £${total.toFixed(2)} from ${buyerName}. Order ID: #${String(newOrderId).substring(0, 8)}.`;
                await sendSms(sellerProfile.phone_number, smsBody);
            }
        }
    }

    return NextResponse.json({ success: true, message: 'Order created successfully', orderId: newOrderId });

  } catch (error: any) {
    console.error('Full order creation failed:', error.message);
    if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: 'Order Creation Failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

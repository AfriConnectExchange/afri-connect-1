
import { NextResponse } from 'next/server';
import { type OrderDetails, type TrackingEvent } from '@/components/tracking/types';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.PROJECT_ID,
  clientEmail: process.env.CLIENT_EMAIL,
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
    try {
        initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e) {
        console.error('Firebase Admin initialization error', e);
    }
}

export async function GET(request: Request) {
  if (!getApps().length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not configured' }, { status: 500 });
  }
  const adminFirestore = getFirestore();

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  let orderQuery;
  if (orderId.length > 20) { // Assume it's a doc ID
      orderQuery = adminFirestore.collection('orders').doc(orderId);
  } else { // Assume it's a tracking number
      orderQuery = adminFirestore.collection('orders').where('tracking_number', '==', orderId).limit(1);
  }
  
  const orderSnap = await orderQuery.get();
  
  let orderData: any;
  if ('docs' in orderSnap) { // It's a QuerySnapshot
    if (orderSnap.empty) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    orderData = orderSnap.docs[0].data();
    orderData.id = orderSnap.docs[0].id;
  } else { // It's a DocumentSnapshot
    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    orderData = orderSnap.data();
    orderData.id = orderSnap.id;
  }


  if (!orderData) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  
  const itemsSnap = await adminFirestore.collection('orders').doc(orderData.id).collection('order_items').get();

  const itemsDataPromises = itemsSnap.docs.map(async (itemDoc) => {
    const itemData = itemDoc.data();
    const productSnap = await adminFirestore.collection('products').doc(itemData.product_id).get();
    const productData = productSnap.data();

    let sellerName = 'Unknown Seller';
    if(productData?.seller_id) {
        const sellerSnap = await adminFirestore.collection('profiles').doc(productData.seller_id).get();
        sellerName = sellerSnap.data()?.full_name || 'Unknown Seller';
    }
    
    return {
      ...itemData,
      product: {
        id: productSnap.id,
        title: productData?.title || 'Unknown Product',
        images: productData?.images || [],
        seller: {
          id: productData?.seller_id,
          full_name: sellerName
        }
      }
    };
  });
  
  const itemsData = await Promise.all(itemsDataPromises);

  let buyerName = 'N/A';
  if(orderData.buyer_id) {
    const buyerSnap = await adminFirestore.collection('profiles').doc(orderData.buyer_id).get();
    buyerName = buyerSnap.data()?.full_name || 'N/A';
  }

  const shippingAddress = orderData.shipping_address as any;
  const orderStatus = orderData.status as OrderDetails['status'];

  // Mock tracking events for now as we don't have a table for them
  const events: TrackingEvent[] = [];
  const orderPlacedTime = new Date(orderData.created_at);
  events.push({ id: '1', status: 'Order Placed', description: 'Your order has been received.', location: 'Online', timestamp: orderPlacedTime.toISOString(), isCompleted: true });

  const processingTime = new Date(orderPlacedTime.getTime() + 3 * 3600 * 1000); 
  if (['processing', 'shipped', 'in-transit', 'out-for-delivery', 'delivered'].includes(orderStatus)) {
    events.push({ id: '2', status: 'Processing', description: 'Seller is preparing your order.', location: 'Seller Warehouse', timestamp: processingTime.toISOString(), isCompleted: true, isCurrent: orderStatus === 'processing' });
  }

  const shippedTime = new Date(processingTime.getTime() + 21 * 3600 * 1000); 
  if (['shipped', 'in-transit', 'out-for-delivery', 'delivered'].includes(orderStatus)) {
    events.push({ id: '3', status: 'Shipped', description: 'Package has been dispatched.', location: 'Origin Facility', timestamp: shippedTime.toISOString(), isCompleted: true, isCurrent: orderStatus === 'shipped' });
  }
  
  const transitTime = new Date(shippedTime.getTime() + 48 * 3600 * 1000); 
  if (['in-transit', 'out-for-delivery', 'delivered'].includes(orderStatus)) {
     events.push({ id: '4', status: 'In Transit', description: 'Package is on its way to you.', location: 'Regional Hub', timestamp: transitTime.toISOString(), isCompleted: true, isCurrent: orderStatus === 'in-transit' });
  }
  
  const deliveryTime = new Date(transitTime.getTime() + 24 * 3600 * 1000); 
  if (['out-for-delivery', 'delivered'].includes(orderStatus)) {
     events.push({ id: '5', status: 'Out for Delivery', description: 'Your package is out for final delivery.', location: 'Local Delivery Center', timestamp: deliveryTime.toISOString(), isCompleted: true, isCurrent: orderStatus === 'out-for-delivery' });
  }
  
  if (orderStatus === 'delivered' && orderData.actual_delivery_date) {
    events.push({ id: '6', status: 'Delivered', description: 'Your package has been delivered.', location: shippingAddress?.city || 'Delivery Address', timestamp: new Date(orderData.actual_delivery_date).toISOString(), isCompleted: true, isCurrent: true });
  }

  const subtotal = itemsData.reduce((acc, item) => acc + (item.price_at_purchase * item.quantity), 0);
  const deliveryFee = orderData.total_amount - subtotal;

  const response: OrderDetails = {
    id: orderData.id,
    tracking_number: orderData.tracking_number || 'N/A',
    status: orderStatus,
    courier_name: orderData.courier_name || 'AfriConnect Logistics',
    estimatedDelivery: new Date(orderPlacedTime.getTime() + 5 * 24 * 3600 * 1000).toISOString(),
    actualDelivery: orderData.actual_delivery_date || undefined,
    created_at: orderData.created_at,
    items: itemsData.map(item => ({
      id: item.product!.id,
      name: item.product!.title,
      image: item.product!.images?.[0] || 'https://placehold.co/100x100',
      quantity: item.quantity,
      price: parseFloat(item.price_at_purchase),
      seller: {
          id: item.product!.seller!.id,
          name: item.product!.seller!.full_name,
      }
    })),
    shippingAddress: {
      name: buyerName || shippingAddress?.name || 'N/A',
      street: shippingAddress?.street || 'N/A',
      city: shippingAddress?.city || 'N/A',
      postcode: shippingAddress?.postcode || 'N/A',
      phone: shippingAddress?.phone || 'N/A',
    },
    payment: {
        method: orderData.payment_method || 'Card',
        subtotal: subtotal,
        deliveryFee: deliveryFee > 0 ? deliveryFee : 0,
        total: orderData.total_amount,
    },
    events: events.reverse(),
  };

  return NextResponse.json(response);
}

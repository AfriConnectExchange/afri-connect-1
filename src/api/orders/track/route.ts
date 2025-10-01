
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type OrderDetails, type TrackingEvent } from '@/components/tracking/types';

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      tracking_number,
      courier_name,
      status,
      created_at,
      actual_delivery_date,
      shipping_address,
      total_amount,
      payment_method,
      buyer:profiles (full_name)
    `)
    .or(`id.eq.${orderId},tracking_number.eq.${orderId}`)
    .single();

  if (orderError || !orderData) {
    console.error('Tracking error:', orderError);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      quantity,
      price_at_purchase,
      product:products (id, title, images, seller:profiles(id, full_name))
    `)
    .eq('order_id', orderData.id);

  if (itemsError) {
    console.error('Order items error:', itemsError);
    return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
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
      name: orderData.buyer?.full_name || shippingAddress?.name || 'N/A',
      street: shippingAddress?.street || 'N/A',
      city: shippingAddress?.city || 'N/A',
      postcode: shippingAddress?.postcode || 'N/A',
      phone: shippingAddress?.phone || 'N/A',
    },
    payment: {
        method: orderData.payment_method || 'Card',
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: orderData.total_amount,
    },
    events: events.reverse(),
  };

  return NextResponse.json(response);
}

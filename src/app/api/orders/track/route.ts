import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type OrderDetails, type TrackingEvent } from '@/components/tracking/order-tracking-page';

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
      status,
      created_at,
      shipping_address,
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
      product:products (id, title, images)
    `)
    .eq('order_id', orderData.id);

  if (itemsError) {
    console.error('Order items error:', itemsError);
    return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
  }

  const shippingAddress = orderData.shipping_address as any;

  // Mock tracking events for now as we don't have a table for them
  const events: TrackingEvent[] = [
    { id: '1', status: 'Order Placed', description: 'Your order has been received.', location: 'Online', timestamp: orderData.created_at, isCompleted: true },
    { id: '2', status: 'Processing', description: 'Seller is preparing your order.', location: 'Seller Warehouse', timestamp: new Date(new Date(orderData.created_at).getTime() + 3600 * 1000).toISOString(), isCompleted: true, isCurrent: orderData.status === 'processing' },
  ];
  if(orderData.status === 'shipped' || orderData.status === 'in-transit' || orderData.status === 'delivered') {
    events.push({ id: '3', status: 'Shipped', description: 'Package has been dispatched.', location: 'Origin Facility', timestamp: new Date(new Date(orderData.created_at).getTime() + 24 * 3600 * 1000).toISOString(), isCompleted: true, isCurrent: orderData.status === 'shipped' });
  }

  const response: OrderDetails = {
    id: orderData.id,
    tracking_number: orderData.tracking_number || 'N/A',
    status: orderData.status as OrderDetails['status'],
    courierName: 'AfriConnect Logistics', // Mock
    estimatedDelivery: new Date(new Date(orderData.created_at).getTime() + 5 * 24 * 3600 * 1000).toISOString(), // Mock: 5 days
    items: itemsData.map(item => ({
      id: item.product!.id,
      name: item.product!.title,
      image: item.product!.images?.[0] || 'https://placehold.co/100x100',
      quantity: item.quantity,
      price: parseFloat(item.price_at_purchase),
    })),
    shippingAddress: {
      name: orderData.buyer?.full_name || shippingAddress?.name || 'N/A',
      street: shippingAddress?.street || 'N/A',
      city: shippingAddress?.city || 'N/A',
      postcode: shippingAddress?.postcode || 'N/A',
      phone: shippingAddress?.phone || 'N/A',
    },
    events,
  };


  return NextResponse.json(response);
}

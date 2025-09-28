import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  console.log(`Tracking order: ${orderId}`);
  if (orderId === 'ORD-123') {
    return NextResponse.json({
      orderId,
      status: 'in-transit',
      trackingNumber: 'TRK-456',
      events: [
        { status: 'In Transit', description: 'Departed from hub', location: 'London, UK', timestamp: new Date().toISOString() },
        { status: 'Shipped', description: 'Package picked up by courier', location: 'Lagos, NG', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    });
  }
  return NextResponse.json(null);
}

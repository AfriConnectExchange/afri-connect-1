import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange');
  console.log(`Fetching trading analytics for range: ${timeRange}`);
  return NextResponse.json({ success: true, data: { transactions: 100, volume: 5000, activeUsers: 50 } });
}

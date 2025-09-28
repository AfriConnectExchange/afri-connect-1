import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const smeId = searchParams.get('smeId');
  console.log(`Fetching SME analytics for: ${smeId}`);
  return NextResponse.json({ success: true, data: { profileViews: 250, sales: 25, rating: 4.8 } });
}

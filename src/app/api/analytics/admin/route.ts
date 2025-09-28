import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get('dataType');
  console.log(`Fetching admin analytics for: ${dataType}`);
  return NextResponse.json({ success: true, data: { total: 1500, change: 0.05 } });
}

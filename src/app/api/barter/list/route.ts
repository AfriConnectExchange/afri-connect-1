import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  console.log('Listing barter proposals for user:', userId);
  return NextResponse.json({ success: true, proposals: [] });
}

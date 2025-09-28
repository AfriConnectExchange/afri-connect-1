import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { advertId } = await request.json();
  console.log('Deleting advert:', advertId);
  return NextResponse.json({ success: true, message: 'Advert deleted successfully.' });
}

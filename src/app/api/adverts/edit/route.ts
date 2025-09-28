import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const advert = await request.json();
  console.log('Editing advert:', advert);
  return NextResponse.json({ success: true, message: 'Advert updated successfully.', advertId: advert.id });
}

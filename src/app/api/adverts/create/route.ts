import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const advert = await request.json();
  const newId = `ADVERT-${Date.now()}`;
  console.log('Creating advert:', { ...advert, id: newId });
  return NextResponse.json({ success: true, message: 'Advert created successfully.', advertId: newId });
}

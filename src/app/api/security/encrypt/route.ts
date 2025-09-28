import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { data } = await request.json();
  console.log('Encrypting data...');
  const encryptedData = `encrypted(${data})`;
  return NextResponse.json({ success: true, encryptedData });
}

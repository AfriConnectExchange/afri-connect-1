import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  console.log(`Fetching security logs for user ${userId}`);
  return NextResponse.json({ success: true, logs: ['User logged in from new device.', 'Password updated.'] });
}

import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  console.log(`Fetching remittance history for user: ${userId}`);
  return NextResponse.json([
    { id: 'REM-123', amount: 100, date: new Date().toISOString(), status: 'Completed', recipient: 'Jane Doe' }
  ]);
}

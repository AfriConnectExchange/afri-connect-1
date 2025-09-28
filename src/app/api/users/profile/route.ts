import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  console.log(`Fetching profile for user: ${userId}`);
  if (userId === 'USER-123') {
    return NextResponse.json({
      id: userId,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roleIds: ['buyer'],
    });
  }
  return NextResponse.json(null);
}

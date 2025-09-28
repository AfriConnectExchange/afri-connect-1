import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { disputeId, action, resolutionNotes } = await request.json();
  console.log(`Managing dispute ${disputeId} with action: ${action}`);
  return NextResponse.json({ success: true, message: `Dispute ${disputeId} has been resolved.` });
}

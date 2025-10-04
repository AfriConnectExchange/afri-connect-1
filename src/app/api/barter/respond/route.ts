
import { NextResponse } from 'next/server';
import { z } from 'zod';

const respondBarterSchema = z.object({
  proposal_id: z.string().uuid(),
  action: z.enum(['accepted', 'rejected']),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validation = respondBarterSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  // Logic to respond to barter proposal would go here

  return NextResponse.json({ success: true, message: 'Proposal has been responded to.' });
}

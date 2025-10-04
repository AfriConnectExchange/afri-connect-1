
import { NextResponse } from 'next/server';
import { z } from 'zod';

const releaseEscrowSchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: Request) {

  const body = await request.json();
  const validation = releaseEscrowSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  // Logic to release escrow would go here

  return NextResponse.json({ success: true, message: `Escrow released.` });
}

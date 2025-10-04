
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createEscrowSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().positive(),
});

export async function POST(request: Request) {

  const body = await request.json();
  const validation = createEscrowSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  // Logic to create escrow would go here

  return NextResponse.json({ success: true, message: 'Escrow created and funded successfully.' });
}

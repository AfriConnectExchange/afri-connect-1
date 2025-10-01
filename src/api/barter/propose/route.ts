
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const proposeBarterSchema = z.object({
  recipient_product_id: z.string().uuid(),
  proposer_product_id: z.string().uuid(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = proposeBarterSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { recipient_product_id, proposer_product_id, notes } = validation.data;

  // Get recipient_id from the product they own
  const { data: recipientProduct, error: productError } = await supabase
    .from('products')
    .select('seller_id, title')
    .eq('id', recipient_product_id)
    .single();

  if (productError || !recipientProduct) {
    return NextResponse.json({ error: 'Target product not found.' }, { status: 404 });
  }

  const recipient_id = recipientProduct.seller_id;

  if (recipient_id === user.id) {
    return NextResponse.json({ error: 'You cannot propose a barter for your own item.' }, { status: 400 });
  }

  const { data: proposalData, error: proposalError } = await supabase
    .from('barter_proposals')
    .insert({
      proposer_id: user.id,
      recipient_id,
      proposer_product_id,
      recipient_product_id,
      notes,
      status: 'pending',
    })
    .select()
    .single();

  if (proposalError) {
     console.error('Error creating barter proposal:', proposalError);
    return NextResponse.json({ error: 'Failed to create barter proposal.', details: proposalError.message }, { status: 500 });
  }
  
  // Create a notification for the recipient
  await supabase.from('notifications').insert({
    user_id: recipient_id,
    type: 'barter',
    title: 'New Barter Proposal!',
    message: `You have received a new barter proposal for your item "${recipientProduct.title}".`,
    link_url: '/barter' // A future page to view all proposals
  });


  return NextResponse.json({ success: true, message: 'Barter proposal sent successfully.', data: proposalData });
}


import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const respondBarterSchema = z.object({
  proposal_id: z.string().uuid(),
  action: z.enum(['accepted', 'rejected']),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = respondBarterSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
  }

  const { proposal_id, action } = validation.data;

  // 1. Verify the current user is the recipient of this proposal
  const { data: proposal, error: fetchError } = await supabase
    .from('barter_proposals')
    .select('recipient_id, proposer_id, recipient_product:products!recipient_product_id(title)')
    .eq('id', proposal_id)
    .single();

  if (fetchError || !proposal) {
    return NextResponse.json({ error: 'Proposal not found.' }, { status: 404 });
  }

  if (proposal.recipient_id !== user.id) {
    return NextResponse.json({ error: 'You do not have permission to respond to this proposal.' }, { status: 403 });
  }

  // 2. Update the proposal status
  const { data: updatedProposal, error: updateError } = await supabase
    .from('barter_proposals')
    .update({ status: action })
    .eq('id', proposal_id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating barter proposal:', updateError);
    return NextResponse.json({ error: 'Failed to update proposal.', details: updateError.message }, { status: 500 });
  }

  // 3. Create a notification for the proposer
  const notificationTitle = action === 'accepted' ? 'Barter Proposal Accepted!' : 'Barter Proposal Rejected';
  const notificationMessage = `Your barter proposal for "${proposal.recipient_product?.title}" has been ${action}.`;
  
  await supabase.from('notifications').insert({
    user_id: proposal.proposer_id,
    type: 'barter',
    title: notificationTitle,
    message: notificationMessage,
    link_url: '/barter'
  });

  return NextResponse.json({ success: true, message: `Proposal has been ${action}.`, data: updatedProposal });
}

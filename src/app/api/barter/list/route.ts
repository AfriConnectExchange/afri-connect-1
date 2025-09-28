import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all'; // 'sent', 'received', or 'all'

  let query = supabase
    .from('barter_proposals')
    .select(`
      *,
      proposer:profiles!proposer_id ( full_name, avatar_url ),
      recipient:profiles!recipient_id ( full_name, avatar_url ),
      proposer_product:products!proposer_product_id ( title, images ),
      recipient_product:products!recipient_product_id ( title, images )
    `);

  if (type === 'sent') {
    query = query.eq('proposer_id', user.id);
  } else if (type === 'received') {
    query = query.eq('recipient_id', user.id);
  } else {
    query = query.or(`proposer_id.eq.${user.id},recipient_id.eq.${user.id}`);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing barter proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch barter proposals.', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, proposals: data });
}

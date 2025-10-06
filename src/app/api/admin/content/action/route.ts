import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';
import { logSystemEvent } from '@/lib/system-logger';

const schema = z.object({
  action: z.enum(['remove_listing', 'clear_flag']),
  listing_id: z.string().optional(),
  flag_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

    const { action, listing_id, flag_id } = parsed.data;
    const firestore = getAdminFirestore();

    if (action === 'remove_listing') {
      if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });
      await firestore.collection('products').doc(listing_id).delete();
      if (flag_id) await firestore.collection('flags').doc(flag_id).delete();
      try { await logSystemEvent({ uid: 'system' }, { type: 'content_removed', description: `listing ${listing_id} removed by admin` }); } catch (e) {}
      return NextResponse.json({ status: 'removed' });
    }

    if (action === 'clear_flag') {
      if (!flag_id) return NextResponse.json({ error: 'flag_id required' }, { status: 400 });
      await firestore.collection('flags').doc(flag_id).delete();
      try { await logSystemEvent({ uid: 'system' }, { type: 'flag_cleared', description: `flag ${flag_id} cleared by admin` }); } catch (e) {}
      return NextResponse.json({ status: 'cleared' });
    }

    return NextResponse.json({ error: 'unsupported' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

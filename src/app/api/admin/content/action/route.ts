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
    const admin = await requireAdmin(request);
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

    const { action, listing_id, flag_id } = parsed.data;
    const firestore = getAdminFirestore();

    if (action === 'remove_listing') {
      if (!listing_id) return NextResponse.json({ error: 'listing_id required for this action' }, { status: 400 });
      
      // We don't actually delete, we change status to 'removed_by_admin' to preserve data
      await firestore.collection('products').doc(listing_id).update({ status: 'removed_by_admin' });
      
      if (flag_id) await firestore.collection('flags').doc(flag_id).update({ status: 'resolved', reviewed_by: admin.uid, reviewed_at: new Date().toISOString() });
      
      try { await logSystemEvent({ uid: admin.uid }, { type: 'content_moderation', status: 'success', description: `Listing ${listing_id} removed by admin` }); } catch (e) {}
      
      return NextResponse.json({ status: 'removed' });
    }

    if (action === 'clear_flag') {
      if (!flag_id) return NextResponse.json({ error: 'flag_id required for this action' }, { status: 400 });

      await firestore.collection('flags').doc(flag_id).update({ status: 'resolved', reviewed_by: admin.uid, reviewed_at: new Date().toISOString() });
      
      try { await logSystemEvent({ uid: admin.uid }, { type: 'content_moderation', status: 'success', description: `Flag ${flag_id} cleared by admin` }); } catch (e) {}

      return NextResponse.json({ status: 'cleared' });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

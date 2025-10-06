import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();

    const snap = await firestore.collection('flags').orderBy('created_at', 'desc').limit(50).get();
    const flags = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const results = await Promise.all(flags.map(async (f: any) => {
      let listingData = null;
      if (f.target_type === 'product' && f.target_id) {
        const listingRef = firestore.collection('products').doc(f.target_id);
        const listingDoc = await listingRef.get();
        if (listingDoc.exists) {
            listingData = { id: listingDoc.id, ...listingDoc.data() };
        }
      }
      return { flag: f, listing: listingData };
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

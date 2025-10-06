import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();

    const snap = await firestore.collection('flags').orderBy('created_at', 'desc').limit(200).get();
    const flags = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Enrich with listing data (if exists)
    const results = await Promise.all(flags.map(async (f: any) => {
      const listingRef = firestore.collection('products').doc(f.listing_id);
      const listingDoc = await listingRef.get();
      return { flag: f, listing: listingDoc.exists ? listingDoc.data() : null };
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

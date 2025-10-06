
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();

    // In a real app, you'd have a 'flags' collection.
    // For this demo, let's pretend to flag a few items.
    const flags = [
        { id: 'flag1', target_type: 'product', target_id: 'dummy_product_1', reason: 'Inappropriate content', reporter_uid: 'user1', status: 'pending', created_at: new Date().toISOString() },
        { id: 'flag2', target_type: 'product', target_id: 'dummy_product_2', reason: 'Misleading information', reporter_uid: 'user2', status: 'pending', created_at: new Date().toISOString() },
    ];
    // const snap = await firestore.collection('flags').where('status', '==', 'pending').orderBy('created_at', 'desc').limit(50).get();
    // const flags = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const results = await Promise.all(flags.map(async (f: any) => {
      let listingData = null;
      if (f.target_type === 'product' && f.target_id) {
        // Mock product data for demo
        listingData = { id: f.target_id, title: `Flagged Product: ${f.target_id}`, description: "This is a placeholder description for the flagged product.", images: ['https://picsum.photos/seed/flag/200/200'] };
        // In real app:
        // const listingRef = firestore.collection('products').doc(f.target_id);
        // const listingDoc = await listingRef.get();
        // if (listingDoc.exists) {
        //     listingData = { id: listingDoc.id, ...listingDoc.data() };
        // }
      }
      return { flag: f, listing: listingData };
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

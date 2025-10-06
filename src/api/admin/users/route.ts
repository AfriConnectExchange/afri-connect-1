
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();

    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 200);
    const offset = (page - 1) * limit;

    let allResults: any[] = [];

    if (q) {
        const lowerQ = q.toLowerCase();
        // This is not very scalable. For production, use a dedicated search service like Algolia or Typesense.
        const allUsersSnap = await firestore.collection('profiles').get();
        allResults = allUsersSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => 
            u.full_name?.toLowerCase().includes(lowerQ) ||
            u.email?.toLowerCase().includes(lowerQ)
        );
    } else {
        const snap = await firestore.collection('profiles').orderBy('created_at', 'desc').offset(offset).limit(limit).get();
        allResults = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    const paginatedResults = allResults.slice(offset, offset + limit);

    return NextResponse.json({ users: paginatedResults, page, limit, total: allResults.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

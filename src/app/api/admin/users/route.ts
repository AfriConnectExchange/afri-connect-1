
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

// Supports query params: q (search), page (1-based), limit
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();

    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 200);
    const offset = (page - 1) * limit;

    if (!q) {
      // simple pagination by created_at
      const snap = await firestore.collection('profiles').orderBy('created_at', 'desc').offset(offset).limit(limit).get();
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const totalSnap = await firestore.collection('profiles').count().get();
      return NextResponse.json({ users, page, limit, total: totalSnap.data().count });
    }

    // naive search: search by email or full_name using simple queries
    const lowerQ = q.toLowerCase();
    const byEmail = await firestore.collection('profiles').where('email', '>=', lowerQ).where('email', '<=', lowerQ + '\uf8ff').get();
    const byName = await firestore.collection('profiles').where('full_name', '>=', q).where('full_name', '<=', q + '\uf8ff').get();

    const merged = new Map();
    byEmail.docs.forEach(d => merged.set(d.id, { id: d.id, ...d.data() }));
    byName.docs.forEach(d => merged.set(d.id, { id: d.id, ...d.data() }));

    const allResults = Array.from(merged.values());
    const paginatedResults = allResults.slice(offset, offset + limit);

    return NextResponse.json({ users: paginatedResults, page, limit, total: allResults.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

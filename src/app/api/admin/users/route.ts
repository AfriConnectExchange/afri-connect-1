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

    if (!q) {
      // simple pagination by created_at
      const offset = (page - 1) * limit;
      // Firestore doesn't support offset efficiently, but for admin tool it's acceptable for now
      const snap = await firestore.collection('profiles').orderBy('created_at', 'desc').offset(offset).limit(limit).get();
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return NextResponse.json({ users, page, limit });
    }

    // naive search: search by email or full_name using simple queries
    const byEmail = await firestore.collection('profiles').where('email', '>=', q).where('email', '<=', q + '\uf8ff').limit(limit).get();
    const byName = await firestore.collection('profiles').where('full_name', '>=', q).where('full_name', '<=', q + '\uf8ff').limit(limit).get();

    const merged = new Map();
    byEmail.docs.forEach(d => merged.set(d.id, { id: d.id, ...d.data() }));
    byName.docs.forEach(d => merged.set(d.id, { id: d.id, ...d.data() }));

    return NextResponse.json({ users: Array.from(merged.values()).slice(0, limit), page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

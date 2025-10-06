import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const firestore = getAdminFirestore();

    const logsSnap = await firestore.collection('transactions').orderBy('created_at', 'desc').limit(200).get();
    const logs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin, getAdminAuth, getAdminFirestore } from '@/lib/admin-utils';
import { logSystemEvent } from '@/lib/system-logger';

const actionSchema = z.object({
  uid: z.string(),
  action: z.enum(['disable', 'enable', 'promote', 'demote']),
  role: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { uid, action, role } = parsed.data;
    const adminAuth = getAdminAuth();
    const adminFirestore = getAdminFirestore();

    if (action === 'disable' || action === 'enable') {
      const disabled = action === 'disable';
      await adminAuth.updateUser(uid, { disabled });
      await adminFirestore.collection('profiles').doc(uid).set({ disabled }, { merge: true });

      // log
      try {
        await logSystemEvent({ uid }, { type: 'admin_user_update', status: 'success', description: `${action} user ${uid}` });
      } catch (e) {
        console.error('Failed to log admin user action', e);
      }

      return NextResponse.json({ status: 'ok', uid, disabled });
    }

    if (action === 'promote' || action === 'demote') {
      const newRole = action === 'promote' ? (role || 'admin') : (role || 'buyer');
      await adminFirestore.collection('profiles').doc(uid).set({ primary_role: newRole }, { merge: true });

      try {
        await logSystemEvent({ uid }, { type: 'admin_user_role_change', status: 'success', description: `${action} user ${uid} -> ${newRole}` });
      } catch (e) {
        console.error('Failed to log admin role action', e);
      }

      return NextResponse.json({ status: 'ok', uid, primary_role: newRole });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin user action error:', error);
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

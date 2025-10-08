"use server";
import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { requireAdmin } from '@/lib/admin-utils';

export async function POST(request: Request) {
  try {
    // requireAdmin will throw if not admin (it checks session cookie)
    const admin = await requireAdmin(request as any as any);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { uid, approve } = body || {};
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });

    const db = getFirestore();
    const kycRef = db.collection('kyc').doc(uid);
    const profilesRef = db.collection('profiles').doc(uid);

    if (approve) {
      await kycRef.set({ status: 'verified', verified_at: new Date().toISOString() }, { merge: true });
      await profilesRef.set({ kyc_status: 'verified', kyc_verified_at: new Date().toISOString() }, { merge: true });
      // notify user
      try {
        const { queueEmail } = await import('@/lib/email');
        const profileDoc = await profilesRef.get();
        const profile = profileDoc.data() || {};
        if (profile.email) {
          await queueEmail({ to: profile.email, subject: 'KYC Verified', html: `<p>Your identity verification was successful. You can now sell on AfriConnect.</p>`, text: 'Your KYC was verified.' });
        }
      } catch (e) { console.error('Failed to queue kyc verified email', e); }

      return NextResponse.json({ ok: true });
    } else {
      await kycRef.set({ status: 'rejected', verified_at: new Date().toISOString() }, { merge: true });
      await profilesRef.set({ kyc_status: 'rejected', kyc_verified_at: new Date().toISOString() }, { merge: true });
      try {
        const { queueEmail } = await import('@/lib/email');
        const profileDoc = await profilesRef.get();
        const profile = profileDoc.data() || {};
        if (profile.email) {
          await queueEmail({ to: profile.email, subject: 'KYC Rejected', html: `<p>Your KYC submission was rejected. Please review the reason and re-submit.</p>`, text: 'Your KYC was rejected.' });
        }
      } catch (e) { console.error('Failed to queue kyc rejected email', e); }

      return NextResponse.json({ ok: true });
    }
  } catch (err: any) {
    console.error('kyc verify error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

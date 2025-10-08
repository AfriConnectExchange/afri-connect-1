"use server";

import { NextResponse } from 'next/server';
import { getAdminFirestore, requireAdmin } from '@/lib/admin-utils';

export async function GET(request: Request) {
  try {
    await requireAdmin(request as any as any);
    const db = await getAdminFirestore();
    const docs = await db.collection('mail').orderBy('createdAt', 'desc').limit(200).get();
    const items: any[] = [];
    docs.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

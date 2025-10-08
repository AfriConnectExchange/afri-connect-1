"use server";
import { NextResponse } from 'next/server';
import { queueEmail } from '@/lib/email';
import { requireAdmin } from '@/lib/admin-utils';

export async function POST(request: Request) {
  try {
    // Secure this route to only be callable by admins
    await requireAdmin(request as any);

    const body = await request.json();
    const { to, subject, html, text } = body || {};
    if (!to) return NextResponse.json({ error: 'Missing "to" address' }, { status: 400 });

    await queueEmail({ 
      to, 
      subject: subject || 'Test email from AfriConnect', 
      html: html || '<p>This is a test email from AfriConnect</p>', 
      text: text || 'This is a test email from AfriConnect' 
    });

    return NextResponse.json({ ok: true, message: "Email has been queued successfully." });
  } catch (err: any) {
    console.error('Test mail error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

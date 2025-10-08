"use server";

import { NextResponse } from 'next/server';
import { queueEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    // simple token-based protection so this route isn't publicly abused
    const token = request.headers.get('x-internal-mail-token');
    if (process.env.MAIL_INTERNAL_TOKEN && token !== process.env.MAIL_INTERNAL_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.to || !body.subject) {
      return NextResponse.json({ error: 'Missing required fields: to, subject' }, { status: 400 });
    }
    
    // Use the unified queueEmail function
    await queueEmail(body);

    return NextResponse.json({ ok: true, message: 'Email processed by local mailer.' });

  } catch (err: any) {
    console.error('send-local error', err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

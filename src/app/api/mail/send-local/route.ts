"use server";

import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/admin-utils';

export async function POST(request: Request) {
  try {
    // simple token-based protection so this route isn't publicly abused
    const token = request.headers.get('x-internal-mail-token');
    const expected = process.env.MAIL_INTERNAL_TOKEN;
    if (!expected || !token || token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, text, html, from: fromBody, replyTo } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields: to, subject' }, { status: 400 });
    }

    let nodemailer: any;
    try {
      nodemailer = await import('nodemailer');
    } catch (err) {
      return NextResponse.json({ error: 'nodemailer not installed. Run `npm install nodemailer`.' }, { status: 500 });
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
    const from = fromBody || process.env.SMTP_FROM || user || `noreply@${process.env.NEXT_PUBLIC_DOMAIN || 'localhost'}`;

    if (!host || !port) {
      return NextResponse.json({ error: 'Missing SMTP_HOST or SMTP_PORT environment variables' }, { status: 500 });
    }

    const adminDb = await getAdminFirestore();

    // create a mail doc in Firestore to track the attempt (mirrors extension shape)
    const mailDocRef = adminDb.collection('mail').doc();
    const createdAt = new Date().toISOString();
    const basePayload: any = {
      to,
      createdAt,
      message: {
        subject,
        from,
        ...(text ? { text } : {}),
        ...(html ? { html } : {}),
        ...(replyTo ? { replyTo } : {}),
      },
      delivery: {
        attempts: 0,
        state: 'PENDING',
        startTime: null,
        endTime: null,
        error: null,
      },
    };

    await mailDocRef.set(basePayload);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    const startTime = new Date();
    try {
      const info = await transporter.sendMail({ from, to, subject, text, html, replyTo });

      // update delivery info
      await mailDocRef.update({
        'delivery.attempts': 1,
        'delivery.state': 'DELIVERED',
        'delivery.startTime': startTime.toISOString(),
        'delivery.endTime': new Date().toISOString(),
        'delivery.info': info,
      });

      return NextResponse.json({ ok: true });
    } catch (sendErr: any) {
      console.error('send-local send error', sendErr);
      await mailDocRef.update({
        'delivery.attempts': 1,
        'delivery.state': 'ERROR',
        'delivery.startTime': startTime.toISOString(),
        'delivery.endTime': new Date().toISOString(),
        'delivery.error': String(sendErr?.message || sendErr),
      });
      return NextResponse.json({ error: String(sendErr?.message || sendErr) }, { status: 500 });
    }
  } catch (err: any) {
    console.error('send-local error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

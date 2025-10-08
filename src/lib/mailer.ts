"use server";

import nodemailer from 'nodemailer';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/admin-utils';

type MailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  templateData?: any;
};

export async function sendMailNow(opts: MailOptions) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
  const from = opts.from || process.env.SMTP_FROM || user || `noreply@${process.env.NEXT_PUBLIC_DOMAIN || 'localhost'}`;

  if (!host || !port) throw new Error('SMTP not configured');

  const transporter = nodemailer.createTransport({ host, port, secure, auth: user && pass ? { user, pass } : undefined });

  const adminDb = await getAdminFirestore();
  const mailRef = adminDb.collection('mail').doc();
  const createdAt = new Date().toISOString();

  // create initial mail doc
  await mailRef.set({
    to: opts.to,
    createdAt,
    message: {
      subject: opts.subject,
      from,
      ...(opts.text ? { text: opts.text } : {}),
      ...(opts.html ? { html: opts.html } : {}),
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    },
    templateId: opts.templateId || null,
    templateData: opts.templateData || {},
    delivery: { attempts: 0, state: 'PENDING', startTime: null, endTime: null, error: null },
  });

  const startTime = new Date();
  try {
    const info = await transporter.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html, replyTo: opts.replyTo });
    await mailRef.update({ 'delivery.attempts': 1, 'delivery.state': 'DELIVERED', 'delivery.startTime': startTime.toISOString(), 'delivery.endTime': new Date().toISOString(), 'delivery.info': info });
    return { ok: true, info };
  } catch (err: any) {
    await mailRef.update({ 'delivery.attempts': 1, 'delivery.state': 'ERROR', 'delivery.startTime': startTime.toISOString(), 'delivery.endTime': new Date().toISOString(), 'delivery.error': String(err?.message || err) });
    throw err;
  }
}

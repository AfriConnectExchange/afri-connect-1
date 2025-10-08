
"use server";

import nodemailer from 'nodemailer';
import { getAdminFirestore } from '@/lib/admin-utils';
import { renderEmailHtml } from './email-renderer';

type MailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  templateData?: any;
  mailDocId?: string; // Optional ID of the existing Firestore mail document
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
  const mailRef = opts.mailDocId ? adminDb.collection('mail').doc(opts.mailDocId) : null;

  let mailContent = {
    subject: opts.subject,
    html: opts.html,
    text: opts.text
  };

  // If a template is used, render it to get the final HTML and subject
  if (opts.templateId) {
    const rendered = await renderEmailHtml(opts.templateId, opts.templateData);
    mailContent.subject = rendered.subject;
    mailContent.html = rendered.html;
    mailContent.text = `This is an automated email. HTML is required to view it. Subject: ${rendered.subject}`;
  }
  
  const startTime = new Date();
  
  // Update Firestore doc to 'PROCESSING' state
  if (mailRef) {
    await mailRef.update({
      'delivery.state': 'PROCESSING',
      'delivery.startTime': startTime.toISOString(),
    });
  }

  try {
    const info = await transporter.sendMail({ 
      from, 
      to: opts.to, 
      subject: mailContent.subject, 
      text: mailContent.text,
      html: mailContent.html, 
      replyTo: opts.replyTo 
    });
    
    // Update Firestore doc to 'SUCCESS' state
    if (mailRef) {
      await mailRef.update({ 
        'delivery.state': 'SUCCESS', 
        'delivery.endTime': new Date().toISOString(),
        'delivery.info': info 
      });
    }
    return { ok: true, info };

  } catch (err: any) {
    // Update Firestore doc to 'ERROR' state
    if (mailRef) {
      await mailRef.update({ 
        'delivery.state': 'ERROR', 
        'delivery.endTime': new Date().toISOString(),
        'delivery.error': String(err?.message || err)
      });
    }
    throw err;
  }
}

"use server";

import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Queue an email document for the Firestore Send Email extension.
 * Only include properties that are defined so Firestore does not receive `undefined` values.
 */
export async function queueEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  templateData?: any;
}): Promise<void> {
  const db = getFirestore();
  const mailColl = db.collection('mail');

  const payload: any = {
    to: options.to,
    createdAt: new Date().toISOString(),
  };

  const message: any = {
    subject: options.subject,
    from: options.from || process.env.DEFAULT_FROM_EMAIL || 'noreply@africonnect.com',
  };

  if (options.text) message.text = options.text;
  if (options.html) message.html = options.html;
  if (options.replyTo) message.replyTo = options.replyTo || process.env.DEFAULT_REPLY_TO;

  payload.message = message;

  // If a templateId is provided, render the template server-side (React Email)
  if (options.templateId) {
    try {
      const { renderTemplate } = await import('./email-templates');
      const rendered = await renderTemplate(options.templateId, options.templateData || {});
      payload.message.subject = rendered.subject;
      payload.message.html = rendered.html;
      payload.message.text = rendered.text;
      payload.templateId = options.templateId;
      payload.templateData = options.templateData || {};
    } catch (err) {
      console.error('Failed to render template', err);
    }
  }

  // Save mail doc (log) first
  const docRef = await mailColl.add(payload);

  // If configured to send directly, attempt to send via our nodemailer helper
  const mode = (process.env.MAILER_MODE || 'direct').toLowerCase();
  if (mode === 'direct') {
    try {
      const { sendMailNow } = await import('./mailer');
      await sendMailNow({
        to: options.to,
        subject: payload.message.subject,
        html: payload.message.html,
        text: payload.message.text,
        from: payload.message.from,
        replyTo: payload.message.replyTo,
        templateId: options.templateId,
        templateData: options.templateData,
      });
    } catch (err) {
      console.error('Direct send failed, mail queued in Firestore', err);
      // leave the queued doc for manual retry or extension processing
    }
  }
}

export async function generateAndQueueVerificationEmail(email: string, uid: string): Promise<void> {
  try {
    const auth = getAuth();
    const actionUrl = process.env.NEXT_PUBLIC_DOMAIN || process.env.DOMAIN || 'http://localhost:3000';
    const link = await auth.generateEmailVerificationLink(email, { url: `${actionUrl}/onboarding`, handleCodeInApp: true });

    const html = `<p>Welcome to AfriConnect — please verify your email by clicking the link below:</p><p><a href="${link}">Verify email</a></p>`;
    const text = `Welcome to AfriConnect. Verify your email: ${link}`;

    await queueEmail({ to: email, subject: 'Verify your AfriConnect email', html, text });
  } catch (err) {
    console.error('Failed to generate verification link', err);
  }
}

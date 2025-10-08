"use server";

import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getAdminFirestore } from './admin-utils';

/**
 * Queue an email document for the Firestore Send Email extension or send directly via Nodemailer.
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
  const db = await getAdminFirestore();
  const mailColl = db.collection('mail');

  const payload: any = {
    to: [options.to],
    createdAt: new Date().toISOString(),
    delivery: {
      state: 'PENDING',
      startTime: null,
      endTime: null,
      error: null,
      attempts: 0,
    },
  };

  const message: any = {
    subject: options.subject,
  };
  
  if (options.templateId) {
    payload.template = {
      name: options.templateId,
      data: options.templateData || {},
    };
  } else {
    if (options.text) message.text = options.text;
    if (options.html) message.html = options.html;
  }
  
  payload.message = message;
  
  // Save mail doc to Firestore for logging/tracking purposes
  const mailDocRef = await mailColl.add(payload);

  // If configured to send directly via SMTP, attempt to send now.
  const mailerMode = (process.env.MAILER_MODE || 'direct').toLowerCase();
  if (mailerMode === 'direct') {
    try {
      // The sendMailNow function will handle rendering the template if necessary
      const { sendMailNow } = await import('./mailer');
      await sendMailNow({ ...options, mailDocId: mailDocRef.id });
    } catch (err) {
      console.error('Direct email send failed, leaving queued in Firestore.', err);
      // The document is already in Firestore, so the extension can pick it up as a fallback.
    }
  }
}


export async function generateAndQueueVerificationEmail(email: string, uid: string): Promise<void> {
  try {
    const auth = getAuth();
    const actionUrl = process.env.NEXT_PUBLIC_DOMAIN || process.env.DOMAIN || 'http://localhost:9002';
    const link = await auth.generateEmailVerificationLink(email, { url: `${actionUrl}/onboarding`, handleCodeInApp: true });

  await queueEmail({
    to: email,
    subject: 'Verify your AfriConnect email',
    templateId: 'email_verification',
    templateData: { verify_link: link },
  });
  } catch (err) {
    console.error('Failed to generate verification link and queue email', err);
  }
}

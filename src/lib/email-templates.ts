
"use server";

import { renderEmailHtml } from './email-renderer';

export async function renderTemplate(templateId: string, data: Record<string, any> = {}) {
  let subject = '';

  const rendered = await renderEmailHtml(templateId, data);
  const html = rendered.html;
  const text = `This is an automated email. HTML is required to view it. Subject: ${rendered.subject}`;
  
  return { subject: rendered.subject, html, text };
}

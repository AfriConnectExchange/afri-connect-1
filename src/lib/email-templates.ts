"use server";

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// import templates
import WelcomeEmail from '@/email-templates/WelcomeEmail';
import LoginAlert from '@/email-templates/LoginAlert';
import PasswordResetConfirmation from '@/email-templates/PasswordResetConfirmation';

export async function renderTemplate(templateId: string, data: Record<string, any> = {}) {
  let element: React.ReactElement;
  let subject = '';

  switch (templateId) {
    case 'welcome_email':
      element = React.createElement(WelcomeEmail, {
        full_name: data.full_name || data.name || '',
        verify_link: data.verify_link,
        domain: data.domain || process.env.NEXT_PUBLIC_DOMAIN || '',
      });
      subject = data.subject || 'Welcome to AfriConnect!';
      break;

    case 'login_alert':
      element = React.createElement(LoginAlert, {
        full_name: data.full_name || data.name || '',
        time: data.time || new Date().toISOString(),
        ip: data.ip,
        agent: data.agent,
      });
      subject = data.subject || 'New Sign-In to Your AfriConnect Account';
      break;

    case 'password_reset_confirmation':
      element = React.createElement(PasswordResetConfirmation, {
        full_name: data.full_name || data.name || '',
        time: data.time || new Date().toISOString(),
      });
      subject = data.subject || 'Your AfriConnect Password Was Changed';
      break;

    default:
      throw new Error('Unknown templateId ' + templateId);
  }

  const html = '<!doctype html>' + renderToStaticMarkup(element);
  const text = `This is an automated email. HTML is required to view it. Subject: ${subject}`;
  
  return { subject, html, text };
}

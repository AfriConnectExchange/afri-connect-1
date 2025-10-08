"use server";

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// import templates
import WelcomeEmail from '@/email-templates/WelcomeEmail';
import LoginAlert from '@/email-templates/LoginAlert';
import PasswordResetConfirmation from '@/email-templates/PasswordResetConfirmation';

export async function renderTemplate(templateId: string, data: Record<string, any> = {}) {
  switch (templateId) {
    case 'welcome_email': {
      const element = React.createElement(WelcomeEmail, {
        full_name: data.full_name || data.name || '',
        verify_link: data.verify_link,
        domain: data.domain || process.env.NEXT_PUBLIC_DOMAIN || '',
      });
      const html = '<!doctype html>' + renderToStaticMarkup(element);
      const text = data.text || `Welcome ${data.full_name || data.name || ''}`;
      const subject = data.subject || `Welcome to AfriConnect`;
      return { subject, html, text };
    }
    case 'login_alert': {
      const element = React.createElement(LoginAlert, {
        full_name: data.full_name || data.name || '',
        time: data.time || new Date().toISOString(),
        ip: data.ip,
        agent: data.agent,
      });
      const html = '<!doctype html>' + renderToStaticMarkup(element);
      const text = data.text || `New sign-in detected`;
      const subject = data.subject || `New sign-in detected`;
      return { subject, html, text };
    }
    case 'password_reset_confirmation': {
      const element = React.createElement(PasswordResetConfirmation, {
        full_name: data.full_name || data.name || '',
        time: data.time || new Date().toISOString(),
      });
      const html = '<!doctype html>' + renderToStaticMarkup(element);
      const text = data.text || `Your password was changed`;
      const subject = data.subject || `Your AfriConnect password was changed`;
      return { subject, html, text };
    }
    default:
      throw new Error('Unknown templateId ' + templateId);
  }
}

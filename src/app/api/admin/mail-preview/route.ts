
import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';
import { render } from '@react-email/components';
import WelcomeEmail from '@/email-templates/WelcomeEmail';
import LoginAlert from '@/email-templates/LoginAlert';
import PasswordResetConfirmation from '@/email-templates/PasswordResetConfirmation';
import React from 'react';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('template');

    let component: React.ReactElement;
    
    switch (templateId) {
      case 'welcome_email':
        component = React.createElement(WelcomeEmail, { full_name: 'Test User', verify_link: '#' });
        break;
      case 'login_alert':
        component = React.createElement(LoginAlert, { full_name: 'Test User', time: new Date().toISOString(), ip: '127.0.0.1', agent: 'Test Browser' });
        break;
      case 'password_reset_confirmation':
        component = React.createElement(PasswordResetConfirmation, { full_name: 'Test User', time: new Date().toISOString() });
        break;
      default:
        return new NextResponse('Unknown template', { status: 400 });
    }
    
    const html = render(component);
    
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

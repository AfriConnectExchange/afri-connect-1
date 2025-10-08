
import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';
import { queueEmail } from '@/lib/email';
import { z } from 'zod';

const sendSchema = z.object({
  to: z.string().email(),
  templateId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { to, templateId } = parsed.data;

    let subject = '';
    const templateData: any = { full_name: 'Test User', name: 'Test User' };

    switch (templateId) {
      case 'welcome_email':
        subject = 'Welcome to AfriConnect!';
        templateData.verify_link = '#';
        break;
      case 'login_alert':
        subject = 'New Sign-In to Your Account';
        templateData.time = new Date().toISOString();
        templateData.ip = '127.0.0.1';
        templateData.agent = 'Test Preview Browser';
        break;
      case 'password_reset_confirmation':
        subject = 'Your Password Was Changed';
        templateData.time = new Date().toISOString();
        break;
      default:
        return NextResponse.json({ error: 'Unknown template' }, { status: 400 });
    }

    await queueEmail({
      to,
      subject,
      templateId,
      templateData,
    });
    
    return NextResponse.json({ ok: true, message: 'Test email queued' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

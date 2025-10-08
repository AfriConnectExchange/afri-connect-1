import { NextResponse } from 'next/server';
import { requireAdmin, getAdminFirestore } from '@/lib/admin-utils';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireAdmin(request as any as any);
  const id = params.id;
  const db = await getAdminFirestore();
  const doc = await db.collection('mail').doc(id).get();
  if (!doc.exists) return NextResponse.json({ ok: false, error: 'Mail not found' }, { status: 404 });
  const mail = doc.data();
  if (!mail) return NextResponse.json({ ok: false, error: 'Mail data missing' }, { status: 500 });
  const message = mail.message || {};
  try {
    const { sendMailNow } = await import('@/lib/mailer');
    await sendMailNow({
      to: mail.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      from: message.from || mail.from,
      replyTo: message.replyTo || mail.replyTo,
      templateId: mail.templateId,
      templateData: mail.templateData,
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Retry send error', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

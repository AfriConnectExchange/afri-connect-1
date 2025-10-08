"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function TestEmailPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('<p>Test from AfriConnect</p>');
  const [status, setStatus] = useState<string | null>(null);

  const send = async () => {
    setStatus('Sending...');
    try {
      const res = await fetch('/api/mail/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, html }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStatus('Queued — check your inbox and Cloud Functions logs');
    } catch (err: any) {
      setStatus('Error: ' + (err.message || String(err)));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Send Test Email</h1>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">To</label>
          <Input value={to} onChange={(e) => setTo((e.target as HTMLInputElement).value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium">Subject</label>
          <Input value={subject} onChange={(e) => setSubject((e.target as HTMLInputElement).value)} placeholder="Test email" />
        </div>
        <div>
          <label className="block text-sm font-medium">HTML</label>
          <Textarea value={html} onChange={(e) => setHtml((e.target as HTMLTextAreaElement).value)} rows={6} />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={send} disabled={!to}>Send Test Email</Button>
          {status && <div className="text-sm">{status}</div>}
        </div>
      </div>
    </div>
  );
}

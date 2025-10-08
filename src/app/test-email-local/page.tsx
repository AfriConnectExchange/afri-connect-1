"use client";
import { useState } from 'react';

export default function TestEmailLocal() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Test from local');
  const [html, setHtml] = useState('<p>hi</p>');
  const [status, setStatus] = useState<string | null>(null);

  const send = async () => {
    setStatus('Sending...');
    try {
      const res = await fetch('/api/mail/send-local', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, html }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStatus('Sent — check logs and inbox');
    } catch (err: any) {
      setStatus('Error: ' + (err.message || String(err)));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Send Local Test Email</h1>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">To</label>
          <input className="input" value={to} onChange={(e) => setTo((e.target as HTMLInputElement).value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium">Subject</label>
          <input className="input" value={subject} onChange={(e) => setSubject((e.target as HTMLInputElement).value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">HTML</label>
          <textarea className="w-full p-2 border rounded" value={html} onChange={(e) => setHtml((e.target as HTMLTextAreaElement).value)} rows={6} />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={send} disabled={!to}>Send Local</button>
          {status && <div className="text-sm">{status}</div>}
        </div>
      </div>
    </div>
  );
}

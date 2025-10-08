"use client";
import { useEffect, useState } from 'react';

export default function MailLogsAdmin() {
  const [logs, setLogs] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/mail-logs').then(res => res.json()).then(json => {
      if (json.ok) setLogs(json.data);
      else setErr(json.error || 'Failed');
    }).catch(e => setErr(String(e)));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mail logs</h1>
      {err && <div className="text-red-600">{err}</div>}
      <div className="space-y-3">
        {logs.map(l => (
          <div key={l.id} className="border p-3 rounded flex justify-between items-start">
            <div>
              <div><strong>To:</strong> {l.to}</div>
              <div><strong>Subject:</strong> {l.message?.subject}</div>
              <div><strong>State:</strong> {l.delivery?.state}</div>
              <div><strong>Created:</strong> {l.createdAt}</div>
            </div>
            <div className="ml-4">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin/mail-logs/${l.id}/retry`, { method: 'POST' });
                    const j = await res.json();
                    if (!j.ok) alert('Retry failed: ' + (j.error || 'unknown'));
                    else alert('Retry queued/sent');
                  } catch (e) {
                    alert('Retry error: ' + String(e));
                  }
                }}
              >
                Retry
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

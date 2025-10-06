
"use client";

import { useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui/loader';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">System Logs</h2>
      <div className="grid gap-2">
        {logs.map(l => (
          <div key={l.id} className="p-3 border rounded">
            <div className="font-medium">{l.type}</div>
            <div className="text-sm text-muted-foreground">User: {l.profile_id}</div>
            <div className="text-sm text-muted-foreground">When: {l.created_at}</div>
            <div className="text-sm">{l.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

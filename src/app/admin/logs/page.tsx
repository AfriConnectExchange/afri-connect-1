
"use client";

import { useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

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
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'pending': return 'secondary';
      case 'info': return 'outline';
      default: return 'destructive';
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">System & Transaction Logs</h2>
      {logs.length === 0 ? <p className="text-muted-foreground">No logs found.</p> : (
        <Card>
            <CardContent className="p-0">
                <div className="divide-y">
                {logs.map(log => (
                    <div key={log.id} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                        <div className="md:col-span-2">
                           <p className="font-medium text-sm">{log.description}</p>
                           <p className="text-xs text-muted-foreground">User: {log.profile_id}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <Badge variant="secondary" className="capitalize">{log.type?.replace('_', ' ')}</Badge>
                           <Badge variant={getStatusVariant(log.status)} className="capitalize">{log.status}</Badge>
                        </div>
                        <div className="text-left md:text-right text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                    </div>
                ))}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

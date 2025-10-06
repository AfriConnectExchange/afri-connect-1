"use client";

import { useCallback, useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui/loader';
import { useUser } from '@/firebase';

export default function AdminUsersPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users', await res.text());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) return; // avoid fetching if not signed in; middleware will redirect
    fetchUsers();
  }, [user, isUserLoading, fetchUsers]);

  const doAction = async (uid: string, action: 'disable' | 'enable' | 'promote' | 'demote') => {
    setActionLoading(uid);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action, role: action === 'promote' ? 'admin' : 'buyer' }),
      });
      if (res.ok) {
        await fetchUsers();
      } else {
        console.error('Action failed', await res.text());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  if (isUserLoading || loading) return <PageLoader />;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      <div className="grid gap-2">
        {users.map(u => (
          <div key={u.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{u.full_name || u.email || u.id}</div>
              <div className="text-sm text-muted-foreground">Role: {u.primary_role || 'buyer'}</div>
              <div className="text-sm text-muted-foreground">Created: {u.created_at}</div>
            </div>
            <div className="flex gap-2">
              {u.disabled ? (
                <button className="btn" onClick={() => doAction(u.id, 'enable')} disabled={actionLoading === u.id}>Enable</button>
              ) : (
                <button className="btn" onClick={() => doAction(u.id, 'disable')} disabled={actionLoading === u.id}>Disable</button>
              )}
              {u.primary_role === 'admin' ? (
                <button className="btn" onClick={() => doAction(u.id, 'demote')} disabled={actionLoading === u.id}>Demote</button>
              ) : (
                <button className="btn" onClick={() => doAction(u.id, 'promote')} disabled={actionLoading === u.id}>Promote</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

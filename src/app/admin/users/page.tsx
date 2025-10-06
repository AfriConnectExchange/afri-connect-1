
"use client";

import { useCallback, useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui/loader';
import { useUser } from '@/firebase';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmAction, setConfirmAction] = useState<{ uid: string; action: 'disable' | 'enable' | 'promote' | 'demote' } | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, limit: '100' });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        const errorText = await res.text();
        toast({ variant: 'destructive', title: 'Error', description: `Failed to fetch users: ${errorText}`});
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isUserLoading && user) {
        fetchUsers();
    }
  }, [user, isUserLoading, fetchUsers]);

  const handleSearch = () => {
    fetchUsers(searchQuery);
  };

  const doAction = async () => {
    if (!confirmAction) return;
    
    const { uid, action } = confirmAction;

    setActionLoading(uid);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action, role: action === 'promote' ? 'admin' : 'buyer' }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: `User action '${action}' completed successfully.`});
        fetchUsers(searchQuery); // Refetch to show updated state
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Action failed');
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  if (isUserLoading) return <PageLoader />;
  if (!user) return null; // Middleware will handle redirect

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Users</h2>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid gap-2">
          {users.map(u => (
            <div key={u.id} className="p-3 border rounded-lg flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium">{u.full_name || u.email || u.id}</div>
                <div className="text-sm text-muted-foreground">Role: {u.primary_role || 'buyer'}</div>
                <div className="text-xs text-muted-foreground">Created: {new Date(u.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {u.disabled ? (
                  <Button size="sm" variant="outline" onClick={() => setConfirmAction({ uid: u.id, action: 'enable' })} disabled={actionLoading === u.id}>Enable</Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmAction({ uid: u.id, action: 'disable' })} disabled={actionLoading === u.id}>Disable</Button>
                )}
                {u.primary_role === 'admin' ? (
                  <Button size="sm" variant="secondary" onClick={() => setConfirmAction({ uid: u.id, action: 'demote' })} disabled={actionLoading === u.id}>Demote</Button>
                ) : (
                  <Button size="sm" onClick={() => setConfirmAction({ uid: u.id, action: 'promote' })} disabled={actionLoading === u.id}>Promote</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmAction && (
        <ConfirmationModal 
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={doAction}
          title={`Confirm Action: ${confirmAction.action}`}
          description={`Are you sure you want to ${confirmAction.action} this user?`}
          confirmText={`Yes, ${confirmAction.action}`}
          type={confirmAction.action === 'disable' || confirmAction.action === 'demote' ? 'destructive' : 'default'}
          isLoading={!!actionLoading}
        />
      )}
    </div>
  );
}

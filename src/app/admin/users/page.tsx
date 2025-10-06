
"use client";

import { useCallback, useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui/loader';
import { useUser } from '@/firebase';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';


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
  if (!user) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">User Management</h2>

      <div className="flex gap-2">
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
        <Card>
            <CardContent className="p-0">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(u => (
                            <TableRow key={u.id}>
                                <TableCell>
                                    <div className="font-medium">{u.full_name || 'N/A'}</div>
                                    <div className="text-sm text-muted-foreground">{u.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={u.primary_role === 'admin' ? 'default' : 'secondary'} className="capitalize">{u.primary_role || 'buyer'}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={u.disabled ? 'destructive' : 'outline'}>{u.disabled ? 'Disabled' : 'Active'}</Badge>
                                </TableCell>
                                <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={actionLoading === u.id}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {u.disabled ? (
                                                <DropdownMenuItem onClick={() => setConfirmAction({ uid: u.id, action: 'enable' })}>Enable User</DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => setConfirmAction({ uid: u.id, action: 'disable' })}>Disable User</DropdownMenuItem>
                                            )}
                                            {u.primary_role === 'admin' ? (
                                                <DropdownMenuItem onClick={() => setConfirmAction({ uid: u.id, action: 'demote' })}>Demote to Buyer</DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => setConfirmAction({ uid: u.id, action: 'promote' })}>Promote to Admin</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
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

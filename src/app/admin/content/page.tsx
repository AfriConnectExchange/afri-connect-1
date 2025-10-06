
"use client";
import { useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export default function AdminContentPage() {
  const [flaggedItems, setFlaggedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ listing_id: string, flag_id: string, action: 'remove_listing' | 'clear_flag' } | null>(null);
  const { toast } = useToast();

  const fetchFlaggedItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content/flagged');
      if (res.ok) {
        const data = await res.json();
        setFlaggedItems(data.results || []);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch flagged items.' });
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedItems();
  }, []);

  const handleAction = async () => {
    if (!confirmAction) return;

    const { listing_id, flag_id, action } = confirmAction;
    setActionLoading(flag_id);
    try {
      const res = await fetch('/api/admin/content/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id, flag_id, action }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: `Action '${action}' completed.` });
        fetchFlaggedItems();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Action failed.');
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>
      {flaggedItems.length === 0 ? (
        <p className="text-muted-foreground">No items currently flagged for review.</p>
      ) : (
        <div className="grid gap-4">
          {flaggedItems.map(({ flag, listing }) => (
            <div key={flag.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="capitalize">{flag.target_type}: {flag.target_id.substring(0, 8)}...</Badge>
                <p className="text-xs text-muted-foreground">{new Date(flag.created_at).toLocaleString()}</p>
              </div>
              <p className="font-medium mb-2">Reason: <span className="text-red-600">{flag.reason}</span></p>
              <p className="text-sm mb-4">Reported by: User {flag.reporter_uid.substring(0,8)}...</p>

              {listing && (
                <div className="bg-muted/50 p-3 rounded-md mb-4 flex items-start gap-4">
                  <Image src={listing.images?.[0] || '/placeholder.svg'} alt={listing.title} width={80} height={80} className="rounded-md object-cover" />
                  <div>
                    <h4 className="font-semibold">{listing.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => setConfirmAction({ listing_id: listing.id, flag_id: flag.id, action: 'remove_listing' })}>Remove Listing</Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmAction({ listing_id: listing.id, flag_id: flag.id, action: 'clear_flag' })}>Clear Flag</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmAction && (
        <ConfirmationModal 
            isOpen={!!confirmAction}
            onClose={() => setConfirmAction(null)}
            onConfirm={handleAction}
            title={`Confirm: ${confirmAction.action.replace('_', ' ')}`}
            description="Are you sure you want to perform this action? It may not be reversible."
            confirmText="Confirm"
            type={confirmAction.action === 'remove_listing' ? 'destructive' : 'default'}
            isLoading={actionLoading === confirmAction.flag_id}
        />
      )}
    </div>
  );
}

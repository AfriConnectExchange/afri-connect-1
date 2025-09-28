'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';

interface AccountActionsProps {
  onFeedback: (type: 'success' | 'error', message: string) => void;
}

export function AccountActions({ onFeedback }: AccountActionsProps) {
  const { auth } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeactivate = () => {
    setShowDeactivateConfirm(true);
  };
  
  const confirmDeactivate = async () => {
     try {
      await auth.signOut();
      toast({ title: 'Account Deactivated', description: 'You have been signed out. Sign in again to reactivate.' });
      router.push('/');
    } catch (e: any) {
      onFeedback('error', e.message || 'Failed to sign out.');
    } finally {
      setShowDeactivateConfirm(false);
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const user = auth.currentUser;
    if (!user) {
      onFeedback('error', 'User not found.');
      setShowDeleteConfirm(false);
      return;
    }
    
    try {
        await user.delete();
        toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
        router.push('/');
    } catch(e: any) {
        onFeedback('error', `Could not delete account: ${e.message}. This may require a recent sign-in.`);
    }

    setShowDeleteConfirm(false);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Manage your account status and data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium">Deactivate Account</h4>
            <p className="text-sm text-muted-foreground">
              Temporarily disable your account by signing out. You can reactivate it by signing in again.
            </p>
            <Button variant="outline" onClick={handleDeactivate}>
              Deactivate Account
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Delete Account</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ConfirmationModal
        isOpen={showDeactivateConfirm}
        onClose={() => setShowDeactivateConfirm(false)}
        onConfirm={confirmDeactivate}
        title="Confirm Deactivation"
        description="This will sign you out of your account. Are you sure you want to proceed?"
        confirmText="Deactivate & Sign Out"
        type="warning"
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirm Account Deletion"
        description="This action is permanent and cannot be undone. Are you absolutely sure?"
        confirmText="Yes, Delete My Account"
        type="destructive"
        consequences={[
            "Your profile and listings will be removed.",
            "You will lose your order history.",
            "This action cannot be reversed."
        ]}
      />
    </>
  );
}

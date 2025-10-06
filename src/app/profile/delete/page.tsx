'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { deleteUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '@/components/ui/animated-button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

export default function DeleteAccountPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [confirmationText, setConfirmationText] = useState('');

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    if (confirmationText !== 'DELETE') {
        toast({ variant: 'destructive', title: 'Confirmation failed', description: "Please type DELETE to confirm."});
        return;
    }

    try {
      await deleteUser(user);
      toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete account. You may need to sign in again.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3">
             <AlertTriangle className="w-6 h-6 text-destructive" />
             <CardTitle>Delete Account</CardTitle>
          </div>
          <CardDescription className="text-destructive">
            This action is permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            We're sorry to see you go. Deleting your account will remove all your personal information, order history, and product listings. This action is irreversible.
          </p>
          <div className="space-y-2">
            <Label htmlFor="confirmation">To confirm, please type "DELETE" in the box below.</Label>
            <Input 
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-destructive/20 px-6 py-4 flex justify-between">
          <Button variant="outline" asChild><Link href="/profile">Cancel</Link></Button>
          <AnimatedButton 
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmationText !== 'DELETE'}
          >
            Delete My Account
        </AnimatedButton>
        </CardFooter>
      </Card>
    </div>
  );
}

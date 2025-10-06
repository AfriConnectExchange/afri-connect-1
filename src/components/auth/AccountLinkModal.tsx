
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedButton } from '@/components/ui/animated-button';
import { useToast } from '@/hooks/use-toast';
import { 
  Auth,
  AuthCredential,
  signInWithEmailAndPassword,
  linkWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User
} from 'firebase/auth';

interface Props {
  open: boolean;
  onClose: () => void;
  auth: Auth;
  email?: string;
  methods: string[];
  pendingCredential: any | null;
  onLinked: (user: User) => void;
}

export default function AccountLinkModal({ open, onClose, auth, email, methods, pendingCredential, onLinked }: Props) {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSignIn = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (!pendingCredential) throw new Error('No pending credential to link');
      const linked = await linkWithCredential(userCred.user, pendingCredential);
      toast({ title: 'Accounts linked', description: 'Your social account is now linked.' });
      onLinked(linked.user);
      onClose();
    } catch (err: any) {
      console.error('Linking via password failed', err);
      toast({ variant: 'destructive', title: 'Link Failed', description: err?.message || 'Could not link accounts.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (providerName: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // After successful sign-in with existing provider, link the pending credential
      if (!pendingCredential) throw new Error('No pending credential to link');
      const linked = await linkWithCredential(result.user, pendingCredential);
      toast({ title: 'Accounts linked', description: 'Your social account is now linked.' });
      onLinked(linked.user);
      onClose();
    } catch (err: any) {
      console.error('Provider sign-in for linking failed', err);
      toast({ variant: 'destructive', title: 'Link Failed', description: err?.message || 'Could not sign in with provider.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Link Accounts</AlertDialogTitle>
          <AlertDialogDescription>
            An account already exists for <strong>{email}</strong>. Please sign in with the existing method to link your social account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {methods.includes('password') && (
          <div className="space-y-2 mb-4">
            <Label htmlFor="link-password">Password</Label>
            <Input id="link-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            <AnimatedButton className="mt-2" onClick={handlePasswordSignIn} isLoading={isLoading}>Sign in & Link</AnimatedButton>
          </div>
        )}

        {methods.some(m => m === 'google.com' || m === 'facebook.com') && (
          <div className="space-y-2">
            <p className="text-sm">Or sign in with the provider below:</p>
            <div className="flex gap-2 mt-2">
              {methods.includes('google.com') && (
                <AnimatedButton onClick={() => handleProviderSignIn('google')} isLoading={isLoading}>Sign in with Google</AnimatedButton>
              )}
              {methods.includes('facebook.com') && (
                <AnimatedButton onClick={() => handleProviderSignIn('facebook')} isLoading={isLoading}>Sign in with Facebook</AnimatedButton>
              )}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

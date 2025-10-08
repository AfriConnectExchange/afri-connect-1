"use client";
import React from 'react';
import { Button } from '@/components/ui/button';

interface ConflictInfo {
  field: 'email' | 'phone';
  existingUid?: string;
  providerNames?: string[];
  profile?: any;
}

interface Props {
  open: boolean;
  info?: ConflictInfo;
  onClose: () => void;
  onLink: () => void;
  onSignIn: () => void;
  onUseDifferent: () => void;
}

export function ConflictModal({ open, info, onClose, onLink, onSignIn, onUseDifferent }: Props) {
  if (!open || !info) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-overlay absolute inset-0 backdrop-blur-sm" onClick={onClose} />
      <div className="relative p-6 bg-card rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Existing account found</h3>
        <p className="mb-4">We found an existing account that uses this {info.field}. You can link this login to that account or sign in to the existing account.</p>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Connected providers:</p>
          <div className="flex gap-2 mt-2">
            {(info.providerNames || []).map((p) => <span key={p} className="px-2 py-1 bg-muted rounded text-sm">{p}</span>)}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onUseDifferent}>Use different {info.field}</Button>
          <Button variant="outline" onClick={onSignIn}>Sign in to existing</Button>
          <Button onClick={onLink}>Link accounts</Button>
        </div>
      </div>
    </div>
  );
}

export default ConflictModal;

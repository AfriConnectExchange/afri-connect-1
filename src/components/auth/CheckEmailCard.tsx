'use client';

import React from 'react';
import { MailCheck } from 'lucide-react';
import { AnimatedButton } from '../ui/animated-button';

interface CheckEmailCardProps {
  email: string;
  onBack: () => void;
  isVerifying: boolean;
}

export default function CheckEmailCard({ email, onBack, isVerifying }: CheckEmailCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden w-full max-w-md">
      <div className="p-8 sm:p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <MailCheck className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-3">Check Your Email</h1>
        <p className="text-sm text-muted-foreground mb-8">
          We've sent a verification link to{' '}
          <span className="font-semibold text-foreground">{email}</span>. Please
          check your inbox and follow the link to activate your account.
        </p>

        {isVerifying ? (
           <div className="flex flex-col items-center justify-center space-y-4 my-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground text-sm">Waiting for verification...</p>
           </div>
        ) : (
            <p className="text-xs text-muted-foreground mb-6">
            This page will automatically redirect after you verify your email.
            </p>
        )}
        
        <AnimatedButton
          onClick={onBack}
          size="lg"
          className="w-full"
          variant="outline"
          disabled={isVerifying}
        >
          Back to Sign In
        </AnimatedButton>
         <p className="text-xs text-muted-foreground mt-6">
          Didn't receive an email? Check your spam folder or try registering again.
        </p>
      </div>
    </div>
  );
}

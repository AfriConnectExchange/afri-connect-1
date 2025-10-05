
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <ForgotPasswordForm />
        <div className="text-center text-sm">
          <Link
            href="/auth"
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

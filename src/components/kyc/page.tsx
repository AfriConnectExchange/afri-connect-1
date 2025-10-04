'use client';
import { KycFlow } from '@/components/kyc/kyc-flow';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { PageLoader } from '@/components/ui/loader';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';

export default function KycPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:gap-8 md:p-8">
        <KycFlow onNavigate={router.push} />
      </main>
    </div>
  );
}

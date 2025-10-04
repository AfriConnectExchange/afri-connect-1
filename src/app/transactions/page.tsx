'use client';

import { Header } from '@/components/dashboard/header';
import { TransactionHistoryPage } from '@/components/transactions/transaction-history-page';
import { PageLoader } from '@/components/ui/loader';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function TransactionsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  },[user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <PageLoader />;
  }
  
  return (
    <div className="min-h-screen bg-muted/40">
        <Header />
        <main className="flex-1 p-4 md:gap-8 md:p-8">
            <TransactionHistoryPage />
        </main>
    </div>
  )
}

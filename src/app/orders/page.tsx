'use client';
import { Header } from '@/components/dashboard/header';
import { MyOrdersPage } from '@/components/orders/my-orders-page';
import { PageLoader } from '@/components/ui/loader';
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function OrdersPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <PageLoader />;
  }
  
  return (
    <div className="min-h-screen bg-muted/40">
        <Header />
        <main className="flex-1 p-4 md:gap-8 md:p-8">
            <MyOrdersPage />
        </main>
    </div>
  )
}

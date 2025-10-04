'use client';

import { Header } from '@/components/dashboard/header';
import { NotificationsPage } from '@/components/notifications/notifications-page';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/loader';
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useUser } from '@/firebase';

export default function Notifications() {
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1">
        <NotificationsPage onNavigate={router.push} />
      </main>
    </div>
  );
}

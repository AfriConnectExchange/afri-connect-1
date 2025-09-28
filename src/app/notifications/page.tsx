'use client';

import { Header } from '@/components/dashboard/header';
import { NotificationsPage } from '@/components/notifications/notifications-page';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/loader';
import { useFirebase } from '@/firebase';

export default function Notifications() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  if (isUserLoading) {
    return <PageLoader />;
  }

  if (!user) {
    router.push('/');
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

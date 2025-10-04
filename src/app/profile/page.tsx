'use client';
import { Header } from '@/components/dashboard/header';
import { ProfilePage } from '@/components/profile/profile-page';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/loader';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useUser } from '@/firebase';

export default function UserProfilePage() {
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
      <main className="flex-1 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <ProfilePage />
        </div>
      </main>
    </div>
  );
}

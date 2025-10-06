'use client';
import { useUser } from '@/firebase';
import { PageLoader } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProfileSidebar } from '@/components/profile/sidebar';
import { Header } from '@/components/dashboard/header';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
}

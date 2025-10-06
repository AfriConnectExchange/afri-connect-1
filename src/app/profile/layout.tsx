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
    <div className="min-h-screen bg-muted/40">
      <Header />
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <ProfileSidebar />
          </div>
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

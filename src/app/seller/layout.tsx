'use client';
import { useUser } from '@/firebase';
import { PageLoader } from '@/components/ui/loader';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { SellerSidebar } from '@/components/seller/seller-sidebar';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/seller';

  useEffect(() => {
    if (!isUserLoading) {
      if (!user && !isAuthPage) {
        // If not logged in and not on the auth page, redirect to seller login
        router.push('/seller');
      } else if (user && isAuthPage) {
        // If logged in and on the auth page, redirect to seller dashboard
        router.push('/seller/dashboard');
      }
    }
  }, [user, isUserLoading, router, isAuthPage, pathname]);

  if (isUserLoading && !isAuthPage) {
    return <PageLoader />;
  }
  
  if (!user && !isAuthPage) {
      return <PageLoader/>
  }

  // For the login page, we don't want the sidebar
  if (isAuthPage || !user) {
    return <main className="bg-gray-100">{children}</main>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SellerSidebar />
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}

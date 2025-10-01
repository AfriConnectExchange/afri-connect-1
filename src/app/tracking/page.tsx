'use client';
import { Suspense } from 'react';
import { Header } from '@/components/dashboard/header';
import { OrderTrackingPage } from '@/components/tracking/order-tracking-page';
import { PageLoader } from '@/components/ui/loader';

function TrackingPageContent() {
    return <OrderTrackingPage />;
}

export default function TrackingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:gap-8 md:p-8">
        <Suspense fallback={<PageLoader />}>
            <TrackingPageContent />
        </Suspense>
      </main>
    </div>
  );
}

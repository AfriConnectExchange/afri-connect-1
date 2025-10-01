'use client';
import { Header } from '@/components/dashboard/header';
import { OrderTrackingPage } from '@/components/tracking/order-tracking-page';

export default function TrackingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:gap-8 md:p-8">
        <OrderTrackingPage />
      </main>
    </div>
  );
}

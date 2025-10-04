'use client';
import { Suspense } from 'react';
import { ProposeBarterPage } from '@/components/barter/propose-barter-page';
import { Header } from '@/components/dashboard/header';
import { PageLoader } from '@/components/ui/loader';

function BarterPageContent() {
    return <ProposeBarterPage />;
}

export default function BarterPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<PageLoader />}>
            <BarterPageContent />
        </Suspense>
      </main>
    </>
  );
}

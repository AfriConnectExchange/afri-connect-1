'use client';

import { HelpCenterPage } from '@/components/help/help-center-page';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';

export default function HelpPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path.startsWith('/') ? path : `/${path}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1">
        <HelpCenterPage onNavigate={handleNavigate} />
      </main>
    </div>
  );
}

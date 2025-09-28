'use client';

import { MoneyTransferPage } from '@/components/money-transfer/money-transfer-page';
import { Header } from '@/components/dashboard/header';
import { useRouter } from 'next/navigation';

export default function Remittance() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1">
        <MoneyTransferPage onNavigate={handleNavigate} />
      </main>
    </div>
  );
}

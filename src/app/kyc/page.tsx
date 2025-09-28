'use client';
import { KycFlow } from '@/components/kyc/kyc-flow';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { PageLoader } from '@/components/ui/loader';
import { useFirebase } from '@/firebase';

export default function KycPage() {
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
    <div className="min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:gap-8 md:p-8">
        <KycFlow onNavigate={router.push} />
      </main>
    </div>
  );
}

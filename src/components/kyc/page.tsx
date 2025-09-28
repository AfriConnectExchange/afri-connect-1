'use client';
import { KycFlow } from '@/components/kyc/kyc-flow';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { PageLoader } from '@/components/ui/loader';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function KycPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [supabase, router]);

  if (isLoading) {
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

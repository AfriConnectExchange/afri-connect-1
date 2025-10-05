
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export function FinalStep() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000); 

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="text-center p-6 flex flex-col items-center justify-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center animate-pulse">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-4">All Set!</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Your profile is complete. We are now redirecting you to the marketplace.
      </p>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

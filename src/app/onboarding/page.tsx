'use client';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoader } from '@/components/ui/loader';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function OnboardingPage() {
    const { user, isUserLoading, firestore } = useFirebase();
    const router = useRouter();

    useEffect(() => {
        if (isUserLoading) return;

        if (!user) {
            router.push('/');
            return;
        }

        const checkOnboarding = async () => {
            const profileRef = doc(firestore, "profiles", user.uid);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists() && profileSnap.data().onboarding_completed) {
                router.push('/marketplace');
            }
        };

        checkOnboarding();
    }, [user, isUserLoading, firestore, router]);

    if(isUserLoading || !user) {
         return <PageLoader />;
    }
  
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <OnboardingFlow />
      </div>
    </main>
  );
}

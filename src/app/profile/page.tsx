'use client';
import { Header } from '@/components/dashboard/header';
import { ProfilePage } from '@/components/profile/profile-page';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/loader';
import { useFirebase } from '@/firebase';

export default function UserProfilePage() {
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2 mb-6">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <ProfilePage />
        </div>
      </main>
    </div>
  );
}


'use client';

import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageLoader } from '@/components/ui/loader';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, User as UserIcon, Shield, BarChart2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
      return;
    }

    const fetchProfile = async () => {
        if (!user || !firestore) return;
        try {
            const profileDoc = await getDoc(doc(firestore, "profiles", user.uid));
            if (profileDoc.exists()) {
                setProfile(profileDoc.data());
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    if(user) {
        fetchProfile();
    }
  }, [user, isUserLoading, router, firestore]);

  if (isUserLoading || loadingProfile || !user) {
    return <PageLoader />;
  }

  const canAccess = profile?.primary_role === 'admin';
  
  const navItems = [
    { id: 'user-management', label: 'User Management', href: '/admin/users', icon: UserIcon },
    { id: 'content-moderation', label: 'Content Moderation', href: '/admin/content', icon: Shield },
    { id: 'analytics', label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart2 },
    { id: 'logs', label: 'System Logs', href: '/admin/logs', icon: BookOpen },
  ];

  if (!canAccess) {
    return (
        <div className="min-h-screen bg-muted/40">
            <DashboardHeader title="Access Denied" navItems={[]} />
            <main className="flex flex-1 items-center justify-center p-4 md:p-8">
                 <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            You do not have permission to access the admin dashboard.
                        </p>
                         <Button className="w-full" onClick={() => router.push('/')}>
                            Go to Marketplace
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader title="Admin Dashboard" navItems={navItems} />
      <main className="flex-1 p-4 md:gap-8 md:p-8">
        <AdminDashboard />
      </main>
    </div>
  );
}

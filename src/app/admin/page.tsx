
'use client';

import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageLoader } from '@/components/ui/loader';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { AlertCircle, User as UserIcon, Shield, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
      setIsUserLoading(false);
    };

    fetchUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.push('/');
      } else {
         fetchUserAndProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (isUserLoading || !user) {
    return <PageLoader />;
  }

  // Assuming role_id 5 is for Admin
  const canAccess = profile && profile.role_id === 5;
  
  const navItems = [
    { id: 'user-management', label: 'User Management', href: '#', icon: UserIcon },
    { id: 'content-moderation', label: 'Content Moderation', href: '#', icon: Shield },
    { id: 'analytics', label: 'Platform Analytics', href: '#', icon: BarChart2 },
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
                         <Button className="w-full" onClick={() => router.push('/marketplace')}>
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


'use client';
import { SellerDashboard } from '@/components/adverts/seller-dashboard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PageLoader } from '@/components/ui/loader';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { AlertCircle, Package, TrendingUp, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdvertsPage() {
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

  const canAccess = profile && [2, 3].includes(profile.role_id);

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
                            This page is only available for Sellers and SMEs. To access this feature, please update your role in your profile settings.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" className="w-full" onClick={() => router.push('/marketplace')}>
                                Go to Marketplace
                            </Button>
                            <Button className="w-full" onClick={() => router.push('/profile')}>
                                Go to Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
  }
  
  const navItems = [
    { id: 'adverts', label: 'My Listings', href: '/adverts', icon: Package },
    { id: 'sales', label: 'My Sales', href: '/sales', icon: TrendingUp },
    { id: 'profile', label: 'Marketplace Profile', href: '/profile', icon: UserIcon },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="My Listings" navItems={navItems} />
      <SellerDashboard />
    </div>
  );
}

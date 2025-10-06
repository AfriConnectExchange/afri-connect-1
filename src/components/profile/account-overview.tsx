'use client';

import { useUser, useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Gift, Mail, MapPin } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function AccountOverview() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !firestore) return;
      try {
        const profileDoc = await getDoc(doc(firestore, 'profiles', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, firestore]);
  
  if (loading) {
      return <OverviewSkeleton />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Overview</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Address Book</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">Your default shipping address:</p>
            <address className="text-sm text-muted-foreground not-italic mt-1">
              {profile?.address?.description || 'No address set'}
            </address>
             {profile?.phone_number && <p className="text-sm text-muted-foreground mt-1">{profile.phone_number}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Store Credit</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            <p className="font-semibold">Credit balance: £0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Newsletter Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Manage your email communications to stay updated.
            </p>
            <Button variant="link" className="p-0 h-auto">
              Edit Newsletter preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function OverviewSkeleton() {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-6 w-32" />
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-40" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
}

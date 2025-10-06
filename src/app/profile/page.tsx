'use client';

import { useUser, useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, User as UserIcon, Lock } from 'lucide-react';
import { ProfileCard, ProfileAction } from '@/components/profile/profile-card';

const profileActions: ProfileAction[] = [
    { label: 'Basic Details', href: '/profile/details' },
    { label: 'Edit Phone Number', href: '/profile/phone' },
];

const securityActions: ProfileAction[] = [
    { label: 'Change Password', href: '/profile/password' },
    { label: 'Pin Settings', href: '/profile/pin' },
    { label: 'Delete Account', href: '/profile/delete', isDestructive: true },
];

export default function ProfilePage() {
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

    if(user) {
        fetchProfile();
    }
  }, [user, firestore]);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center space-y-4 mb-10">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-center">
            Hello {profile?.full_name || user?.displayName || 'User'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileCard 
            title="Profile Details"
            icon={<UserIcon className="w-5 h-5 text-muted-foreground" />}
            actions={profileActions}
        />
         <ProfileCard 
            title="Security Settings"
            icon={<Lock className="w-5 h-5 text-muted-foreground" />}
            actions={securityActions}
        />
      </div>
    </div>
  );
}

function ProfilePageSkeleton() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col items-center justify-center space-y-4 mb-10">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-24" />
                         <Skeleton className="h-5 w-28" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-36" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
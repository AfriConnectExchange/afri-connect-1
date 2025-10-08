'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedButton } from '@/components/ui/animated-button';
import Link from 'next/link';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileDetailsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !firestore) return;
      try {
        const profileDoc = await getDoc(doc(firestore, 'profiles', user.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          form.reset({
            fullName: profileData.full_name || user.displayName || '',
            email: profileData.email || user.email || '',
          });
        } else {
            form.reset({
                fullName: user.displayName || '',
                email: user.email || '',
            });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, firestore, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !firestore || !auth.currentUser) return;
    try {
        await updateProfile(auth.currentUser, { displayName: data.fullName });
        await setDoc(doc(firestore, 'profiles', user.uid), { full_name: data.fullName }, { merge: true });
        
        toast({ title: 'Success', description: 'Your profile has been updated.' });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !firestore || !auth.currentUser) return;
    if (file.size > 5 * 1024 * 1024) { toast({ variant: 'destructive', title: 'Error', description: 'Avatar must be <5MB' }); return; }
    setAvatarUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      console.debug('Starting avatar upload for', file.name);

  const res = await fetch('/api/uploads/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl, filename: file.name }), credentials: 'same-origin' });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed');

      // Update auth profile and Firestore
      await updateProfile(auth.currentUser, { photoURL: json.url });
      await setDoc(doc(firestore, 'profiles', user.uid), { avatar_url: json.url }, { merge: true });

      toast({ title: 'Success', description: 'Avatar updated' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to upload avatar' });
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading || isUserLoading) {
    return <ProfileDetailsSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
          <CardDescription>Update your personal information. Your email address cannot be changed.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <img src={user?.photoURL || '/favicon.ico'} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                      <div>
                        <input type="file" accept="image/*" id="avatar-input" className="hidden" onChange={handleAvatarChange} />
                        <Button type="button" variant="outline" onClick={() => document.getElementById('avatar-input')?.click()} disabled={avatarUploading}>{avatarUploading ? 'Uploading...' : 'Change Photo'}</Button>
                      </div>
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                        <Input placeholder="your@email.com" {...field} disabled />
                        </FormControl>
                         <FormDescription>Your email address is used for logging in and cannot be changed.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-between">
                    <Button variant="outline" asChild><Link href="/profile">Cancel</Link></Button>
                    <AnimatedButton type="submit" isLoading={form.formState.isSubmitting}>Save Changes</AnimatedButton>
                </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}

function ProfileDetailsSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Card>
                 <CardHeader>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-full max-w-sm" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                 <CardFooter className="border-t px-6 py-4 flex justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-28" />
                </CardFooter>
            </Card>
        </div>
    )
}

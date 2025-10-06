'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedButton } from '@/components/ui/animated-button';
import Link from 'next/link';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, 'Please enter a valid phone number.'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export default function PhonePage() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
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
            phoneNumber: profileData.phone_number || user.phoneNumber || '',
          });
        } else {
             form.reset({
                phoneNumber: user.phoneNumber || '',
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

  const onSubmit = async (data: PhoneFormValues) => {
    if (!user || !firestore) return;
    try {
        await setDoc(doc(firestore, 'profiles', user.uid), { phone_number: data.phoneNumber }, { merge: true });
        toast({ title: 'Success', description: 'Your phone number has been updated.' });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  if (loading || isUserLoading) {
    return <PhonePageSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Phone Number</CardTitle>
          <CardDescription>Update the phone number associated with your account.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <PhoneInput
                                id="phone"
                                placeholder="Enter phone number"
                                international
                                defaultCountry="GB"
                                {...field}
                            />
                        </FormControl>
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


function PhonePageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Card>
                 <CardHeader>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-full max-w-sm" />
                </CardHeader>
                <CardContent className="space-y-6">
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

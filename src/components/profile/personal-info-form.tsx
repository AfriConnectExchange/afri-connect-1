'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Textarea } from '../ui/textarea';
import { useFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const formSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.').optional().or(z.literal('')),
  location: z.string().optional(),
});

type PersonalInfoFormValues = z.infer<typeof formSchema>;

interface PersonalInfoFormProps {
  onFeedback: (type: 'success' | 'error', message: string) => void;
}

export function PersonalInfoForm({ onFeedback }: PersonalInfoFormProps) {
  const { user, firestore } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      location: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      const docRef = doc(firestore, "profiles", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        form.reset({
          full_name: data.full_name || user.displayName || '',
          phone: data.phone || user.phoneNumber || '',
          location: data.location || '',
        });
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [user, firestore, form]);

  const onSubmit = async (values: PersonalInfoFormValues) => {
    if (!user) return;
    setIsSaving(true);
    const docRef = doc(firestore, "profiles", user.uid);
    try {
        await updateDoc(docRef, values);
        onFeedback('success', 'Profile updated successfully!');
    } catch(e: any) {
        onFeedback('error', e.message || 'Failed to update profile.');
    }
    setIsSaving(false);
  };
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details and contact information.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
             <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+44 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address / Location</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main St, London, UK"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
             <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Profile
              </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AnimatedButton } from '../ui/animated-button';
import { GoogleAddressInput } from './google-address-input';
import { PageLoader } from '../ui/loader';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  businessName: z.string().min(2, 'Business name required'),
  businessType: z.string().min(2, 'Please describe business type'),
  businessEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  businessAddress: z.object({ description: z.string(), place_id: z.string() }).optional(),
});

type Values = z.infer<typeof schema>;

interface Props {
  onNext: (data: any) => void;
  onBack: () => void;
  defaultValues?: Partial<Values>;
}

export function SellerBusinessStep({ onNext, onBack, defaultValues }: Props) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: defaultValues?.businessName || '',
      businessType: defaultValues?.businessType || '',
      businessEmail: defaultValues?.businessEmail || user?.email || '',
      businessAddress: defaultValues?.businessAddress || undefined,
    },
  });

  useEffect(() => {
    setIsClient(true);
    form.reset({
      businessName: defaultValues?.businessName || '',
      businessType: defaultValues?.businessType || '',
      businessEmail: defaultValues?.businessEmail || user?.email || '',
      businessAddress: defaultValues?.businessAddress || undefined,
    });
  }, [user, defaultValues]);

  if (!isClient) return <div className="flex justify-center items-center h-64"><PageLoader/></div>;

  const handleSubmit = async (vals: Values) => {
    // Persist business info to the user's profile immediately to avoid data loss.
    if (user) {
      setIsSaving(true);
      try {
        await setDoc(doc(firestore, 'profiles', user.uid), {
          business: {
            name: vals.businessName,
            type: vals.businessType,
            email: vals.businessEmail || null,
            address: vals.businessAddress || null,
          },
          primary_role: 'seller',
        }, { merge: true });

        toast({ title: 'Saved', description: 'Business details saved.' });
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Failed to save', description: err.message || 'Could not save business details.' });
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }

    onNext(vals);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Tell us about your Business</h2>
        <p className="text-muted-foreground">Just a few details to set up your seller profile. KYC will be completed later.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Store Ltd" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type</FormLabel>
                <FormControl>
                  <Input placeholder="Retail, Manufacturer, Services etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="business@acme.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Address (optional)</FormLabel>
                <FormControl>
                  <GoogleAddressInput
                    onAddressSelect={(place) => field.onChange({ description: place.description, place_id: place.place_id })}
                    initialValue={field.value?.description}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center pt-4">
            <AnimatedButton variant="outline" type="button" onClick={onBack} disabled={isSaving}>Back</AnimatedButton>
            <AnimatedButton type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Continue'}</AnimatedButton>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SellerBusinessStep;

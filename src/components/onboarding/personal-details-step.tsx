'use client';
import { useForm, Controller } from 'react-hook-form';
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
import { AnimatedButton } from '../ui/animated-button';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { GoogleAddressInput } from './google-address-input';
import { PageLoader } from '../ui/loader';
import MissingFieldPrompt from './missing-field-prompt';
import ConflictModal from './conflict-modal';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number.').optional().or(z.literal('')),
  address: z.object({
    description: z.string().min(5, 'Please select a valid address from the suggestions.'),
    place_id: z.string(),
  }).optional(),
});

type PersonalDetailsFormValues = z.infer<typeof formSchema>;

interface PersonalDetailsStepProps {
  onNext: (data: { full_name: string; phone_number: string; address: any; }) => Promise<void>;
  onBack: () => void;
  defaultValues: Partial<PersonalDetailsFormValues>;
}

export function PersonalDetailsStep({ onNext, onBack, defaultValues }: PersonalDetailsStepProps) {
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMissingField, setShowMissingField] = useState<null | 'email' | 'phone'>(null);
  const [conflictInfo, setConflictInfo] = useState<any>(null);
  const [showConflict, setShowConflict] = useState(false);
  const { toast } = useToast();

  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  useEffect(() => {
    setIsClient(true);
    form.reset({
        fullName: user?.displayName || defaultValues.fullName || '',
        // If the authenticated user already has a phone number we don't require the user to change it
        phoneNumber: user?.phoneNumber || defaultValues.phoneNumber || '',
        address: defaultValues.address,
      })
  }, [user, form, defaultValues])

  const onSubmit = async (values: PersonalDetailsFormValues) => {
    setIsSubmitting(true);

    // If we don't have an email on the auth user, ask for email first.
    // The onboarding check endpoint expects email/phone fields.
    // We'll gather whichever identity we have from the current user context.
    const payload: any = {};
    if (user?.email) payload.email = user.email;
    if (values.phoneNumber) payload.phone = values.phoneNumber;

    try {
      const res = await fetch('/api/onboarding/check-identity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'same-origin' });
      const json = await res.json();

      // If provider didn't supply email and we have no email, prompt for it.
      if (!user?.email) {
        setShowMissingField('email');
        setIsSubmitting(false);
        return;
      }

      // If conflict detected for email or phone, show conflict modal
      const { result } = json || {};
      if (result?.email?.exists && !result.email.sameAsCurrent) {
        setConflictInfo({ field: 'email', existingUid: result.email.uid, providerNames: (result.email.providerData || []).map((p:any)=>p.providerId) });
        setShowConflict(true);
        setIsSubmitting(false);
        return;
      }

      if (result?.phone?.exists && !result.phone.sameAsCurrent) {
        setConflictInfo({ field: 'phone', existingUid: result.phone.uid, providerNames: (result.phone.providerData || []).map((p:any)=>p.providerId) });
        setShowConflict(true);
        setIsSubmitting(false);
        return;
      }

      // No conflicts or missing fields -> continue
      await onNext({
        full_name: values.fullName,
        phone_number: values.phoneNumber || '',
        address: values.address || {},
      });

    } catch (err: any) {
      console.error('Onboarding identity check failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMissingSave = async (val: string) => {
    // Save provided email to profile and re-run submit
    if (!user) return;
    await fetch('/api/onboarding/check-identity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: val }), credentials: 'same-origin' });
    setShowMissingField(null);
    // Re-submit the form programmatically
    form.handleSubmit(onSubmit)();
  };

  const handleConflictLink = () => {
    // Kick off client-side linking flow - left as a stub for now.
    // In practice: store the provider credential and ask user to authenticate to existing account to link.
    setShowConflict(false);
    toast({ title: 'Link accounts', description: 'Please sign in to your existing account to link providers.' });
  };

  const handleConflictSignIn = () => {
    setShowConflict(false);
    // redirect to sign-in page or show sign-in modal
    window.location.href = '/auth';
  };

  const handleUseDifferent = () => {
    setShowConflict(false);
    setShowMissingField(conflictInfo.field === 'email' ? 'email' : 'phone');
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-64"><PageLoader/></div>;
  }

  return (
    <div>
        <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground">Just a few more details to get you set up.</p>
        </div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="fullName"
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

            <Controller
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                           <GoogleAddressInput
                             onAddressSelect={(place) => {
                                field.onChange({
                                  description: place.description,
                                  place_id: place.place_id
                                });
                              }}
                              initialValue={field.value?.description}
                           />
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )}
            />
            
            <div className="flex justify-between items-center pt-4">
                <AnimatedButton variant="outline" type="button" onClick={onBack} disabled={isSubmitting}>Back</AnimatedButton>
                <AnimatedButton type="submit" isLoading={isSubmitting}>Finish Setup</AnimatedButton>
            </div>
        </form>
        </Form>
    </div>
  );
}

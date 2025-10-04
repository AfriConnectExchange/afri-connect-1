'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeStep } from './welcome-step';
import { RoleSelectionStep } from './role-selection-step';
import { PersonalDetailsStep } from './personal-details-step';
import { FinalStep } from './final-step';
import { Progress } from '../ui/progress';
import { Logo } from '../logo';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

export function OnboardingFlow() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [userData, setUserData] = useState({
    role_id: 1, // Default to Buyer
    full_name: '',
    phone_number: '',
    location: '',
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setUserData((prev) => ({
          ...prev,
          full_name: user.user_metadata.full_name || user.email || '',
          phone_number: user.phone || '',
          location: user.user_metadata.location || '',
        }));
      }
    };
    getUser();
  }, [supabase]);

  const handleRoleSelection = async (data: { role: string }) => {
    const roleId = parseInt(data.role, 10);
    handleUpdateUserData({ role_id: roleId });

    // For Buyers, we just move to the next step in the UI.
    if (roleId === 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // For Sellers, SMEs, Trainers, redirect to a dedicated, more detailed verification flow.
      // We'll save their chosen role first.
      if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({ role_id: roleId })
            .eq('id', user.id);
          if (error) {
               toast({
                variant: 'destructive',
                title: 'Failed to Save Role',
                description: error.message,
                });
                return;
          }
      }
      toast({
        title: 'Seller Verification Required',
        description: "You'll be redirected to complete your seller profile.",
      });
      router.push('/kyc'); // The KYC page will handle its own multi-step flow.
    }
  };

  const handleOnboardingComplete = async (data: {
    full_name: string;
    phone_number: string;
    location: string;
  }) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone_number: data.phone_number,
        // Using address_line1 for simplicity as per new schema.
        // A more complex form could map to city, country etc.
        address_line1: data.location, 
        onboarding_completed: true,
        role_id: userData.role_id, // ensure role is saved
      })
      .eq('id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to Save Profile', description: error.message });
    } else {
       await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          phone: data.phone_number,
        },
      });
      setCurrentStep((prev) => prev + 1); // Move to final "All Set!" step
    }
  };

  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleUpdateUserData = (data: Partial<typeof userData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
  };
  
  const steps = [
    <WelcomeStep onNext={() => setCurrentStep(1)} />,
    <RoleSelectionStep
      onNext={handleRoleSelection}
      onBack={handleBack}
      onUpdate={(data) => handleUpdateUserData({ role_id: parseInt(data.role, 10) })}
      currentValue={String(userData.role_id)}
    />,
    <PersonalDetailsStep
      onNext={handleOnboardingComplete}
      onBack={handleBack}
      defaultValues={{
        fullName: userData.full_name,
        phoneNumber: userData.phone_number,
        location: userData.location,
      }}
    />,
    <FinalStep />,
  ];

  const progressValue = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="bg-card rounded-2xl shadow-xl border p-4 sm:p-8 w-full">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Logo withText={false} />
        <h1 className="text-2xl font-bold">AfriConnect Exchange</h1>
      </div>
      <Progress value={progressValue} className="mb-8" />
      <div className="min-h-[400px] flex flex-col justify-center">
        {steps[currentStep]}
      </div>
    </div>
  );
}

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
    role_id: '1',
    full_name: '',
    phone_number: '',
    location: '',
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    handleUpdateUserData({ role_id: data.role });

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in.',
      });
      return;
    }

    // Save the role immediately
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

    // --- DYNAMIC FLOW LOGIC ---
    if (roleId === 1) {
      // Buyer: proceed to the next step in the modal
      setCurrentStep((prev) => prev + 1);
    } else {
      // Seller, SME, Trainer: redirect to KYC page
      toast({
        title: 'Verification Required',
        description: "Let's get you verified to start selling.",
      });
      router.push('/kyc');
    }
  };

  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleUpdateUserData = (data: Partial<typeof userData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const handleBuyerDetailsSubmit = async (finalData: { full_name: string; phone_number: string; location: string; }) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to complete onboarding.',
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: finalData.full_name,
        phone_number: finalData.phone_number,
        location: finalData.location,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Save Profile',
        description: error.message,
      });
    } else {
      // Also update the auth user's metadata as a fallback/sync
      await supabase.auth.updateUser({
        data: {
          full_name: finalData.full_name,
          phone: finalData.phone_number,
          location: finalData.location,
        },
      });
      setCurrentStep((prev) => prev + 1); // Move to final step
    }
  };

  const steps = [
    <WelcomeStep onNext={() => setCurrentStep(1)} />,
    <RoleSelectionStep
      onNext={handleRoleSelection}
      onBack={handleBack}
      onUpdate={(data) => handleUpdateUserData({ role_id: data.role })}
      currentValue={userData.role_id}
    />,
    <PersonalDetailsStep
      onNext={handleBuyerDetailsSubmit}
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

'use client';
import React, { useState, useEffect } from 'react';
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
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  const [userData, setUserData] = useState({
    role_id: '1', // Default role_id for 'buyer'
    full_name: '',
    phone: '',
    onboarding_completed: false,
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setUserData((prev) => ({
        ...prev,
        full_name: user?.user_metadata.full_name || user?.email || '',
        phone: user?.phone || '',
      }));
    };
    getUser();
  }, [supabase]);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleUpdateUserData = (data: Partial<typeof userData>) => {
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const handleOnboardingComplete = async () => {
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
        role_id: parseInt(userData.role_id, 10),
        full_name: userData.full_name,
        phone: userData.phone,
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
      handleNext();
    }
  };

  const steps = [
    <WelcomeStep onNext={handleNext} />,
    <RoleSelectionStep
      onNext={handleNext}
      onBack={handleBack}
      onUpdate={(data) => handleUpdateUserData({ role_id: data.role })}
      currentValue={userData.role_id}
    />,
    <PersonalDetailsStep
      onNext={handleOnboardingComplete}
      onBack={handleBack}
      onUpdate={handleUpdateUserData}
      defaultValues={{
        fullName: userData.full_name,
        phoneNumber: userData.phone,
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

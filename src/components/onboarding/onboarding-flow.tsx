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
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';


export function OnboardingFlow() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  const [userData, setUserData] = useState({
    primary_role: 'buyer',
    full_name: '',
    phone_number: '',
    location: '',
    address: {}
  });

  useEffect(() => {
    if (user) {
      setUserData((prev) => ({
        ...prev,
        full_name: user.displayName || user.email || '',
        phone_number: user.phoneNumber || '',
      }));
    }
  }, [user]);

  const handleRoleSelection = async (data: { role: string }) => {
    const role = data.role as 'buyer' | 'seller' | 'sme' | 'trainer';
    handleUpdateUserData({ primary_role: role });

    if (role === 'buyer') {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (user) {
          try {
            await setDoc(doc(firestore, "profiles", user.uid), { primary_role: role }, { merge: true });
          } catch(error: any) {
              toast({ variant: 'destructive', title: 'Failed to Save Role', description: error.message });
              return;
          }
      }
      toast({
        title: 'Seller Verification Required',
        description: "You'll be redirected to complete your seller profile.",
      });
      router.push('/kyc');
    }
  };

  const handleOnboardingComplete = async (data: {
    full_name: string;
    phone_number: string;
    address: any;
  }) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    try {
      await setDoc(doc(firestore, "profiles", user.uid), {
        full_name: data.full_name,
        phone_number: data.phone_number,
        address: data.address,
        onboarding_completed: true,
        primary_role: userData.primary_role,
        email: user.email,
        id: user.uid,
        auth_user_id: user.uid,
      }, { merge: true });

      setCurrentStep((prev) => prev + 1);
    } catch(error: any) {
      toast({ variant: 'destructive', title: 'Failed to Save Profile', description: error.message });
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
      onUpdate={(data) => handleUpdateUserData({ primary_role: data.role as 'buyer' | 'seller' | 'sme' | 'trainer' })}
      currentValue={String(userData.primary_role)}
    />,
    <PersonalDetailsStep
      onNext={handleOnboardingComplete}
      onBack={handleBack}
      defaultValues={{
        fullName: userData.full_name,
        phoneNumber: userData.phone_number,
        address: userData.address,
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

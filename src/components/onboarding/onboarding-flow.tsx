'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeStep } from './welcome-step';
import { RoleSelectionStep } from './role-selection-step';
import { PersonalDetailsStep } from './personal-details-step';
import { SellerBusinessStep } from './seller-business-step';
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

  const [userData, setUserData] = useState<{
    primary_role: 'buyer' | 'seller' | 'sme' | 'trainer';
    full_name: string;
    phone_number: string;
    location: string;
    address: any;
    business?: any;
  }>({
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
    setCurrentStep((prev) => prev + 1);
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
      const profileUpdate: any = {
        full_name: data.full_name,
        phone_number: data.phone_number,
        address: data.address,
        onboarding_completed: true,
        primary_role: userData.primary_role,
        email: user.email,
        id: user.uid,
        auth_user_id: user.uid,
      };

      if (userData.business) {
        profileUpdate.business = userData.business;
      }

      await setDoc(doc(firestore, "profiles", user.uid), profileUpdate, { merge: true });

      if (['seller', 'sme', 'trainer'].includes(userData.primary_role)) {
        toast({ title: 'Profile Updated!', description: 'Redirecting you to the seller dashboard.'});
        router.push('/seller/dashboard');
      } else {
        setCurrentStep(steps.length - 1);
      }
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
    ...(userData.primary_role !== 'buyer' ? [
      <SellerBusinessStep
        onNext={(data) => {
          handleUpdateUserData({ business: data });
          setCurrentStep((prev) => prev + 1);
        }}
        onBack={handleBack}
        defaultValues={userData.business}
      />
    ] : []),
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

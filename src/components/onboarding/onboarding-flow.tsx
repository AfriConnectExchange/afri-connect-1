'use client';
import React, { useState, useEffect } from 'react';
import { WelcomeStep } from './welcome-step';
import { RoleSelectionStep } from './role-selection-step';
import { PersonalDetailsStep } from './personal-details-step';
import { FinalStep } from './final-step';
import { Progress } from '../ui/progress';
import { Logo } from '../logo';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const { user, auth, firestore } = useFirebase();

  const [userData, setUserData] = useState({
    role: '1', // Default role_id for 'buyer'
    fullName: user?.displayName || '',
    location: '',
    phoneNumber: user?.phoneNumber || ''
  });

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);
  
  const handleUpdateUserData = (data: Partial<typeof userData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const handleOnboardingComplete = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to complete onboarding.' });
        return;
    }
    
    try {
        const profileRef = doc(firestore, "profiles", user.uid);
        await updateDoc(profileRef, {
            full_name: userData.fullName,
            location: userData.location,
            phone: userData.phoneNumber,
            role_id: parseInt(userData.role, 10),
            onboarding_completed: true,
        });

        handleNext();

    } catch(e: any) {
         toast({ variant: 'destructive', title: 'Onboarding Failed', description: e.message || 'An unexpected error occurred.' });
    }
  }

  const steps = [
    <WelcomeStep onNext={handleNext} />,
    <RoleSelectionStep onNext={handleNext} onBack={handleBack} onUpdate={handleUpdateUserData} currentValue={userData.role} />,
    <PersonalDetailsStep onNext={handleOnboardingComplete} onBack={handleBack} onUpdate={handleUpdateUserData} defaultValues={userData} />,
    <FinalStep />
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

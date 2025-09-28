'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { KYCStep } from './kyc-flow';

interface KycProgressProps {
    currentStep: KYCStep;
}

const steps = [
    { id: 'personal', title: 'Personal' },
    { id: 'business', title: 'Business' },
    { id: 'documents', title: 'Documents' },
    { id: 'review', title: 'Review' },
    { id: 'complete', title: 'Complete' }
];

export function KycProgress({ currentStep }: KycProgressProps) {

  const getStepNumber = (stepId: string) => {
    return steps.findIndex(step => step.id === stepId) + 1;
  };

  const getProgressPercentage = () => {
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);
    return ((currentStepIndex) / (steps.length - 1)) * 100;
  };

  return (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Verification Progress</span>
            <span className="text-sm text-muted-foreground">
                Step {getStepNumber(currentStep)} of {steps.length}
            </span>
            </div>
            <Progress value={getProgressPercentage()} className="mb-4" />
            <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step) => (
                <span key={step.id} className={currentStep === step.id ? 'text-primary font-medium' : ''}>
                {step.title}
                </span>
            ))}
            </div>
        </CardContent>
    </Card>
  );
}

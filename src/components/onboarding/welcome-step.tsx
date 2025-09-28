'use client';
import { AnimatedButton } from '../ui/animated-button';
import { PartyPopper } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center p-6">
       <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <PartyPopper className="w-10 h-10 text-primary" />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-4">Welcome to AfriConnect Exchange!</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Your account has been created. Let's get your profile set up so you can start connecting and trading.
      </p>
      <AnimatedButton onClick={onNext} size="lg" animationType='glow'>
        Get Started
      </AnimatedButton>
    </div>
  );
}

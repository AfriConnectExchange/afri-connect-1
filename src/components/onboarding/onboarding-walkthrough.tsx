'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Search, ShoppingCart, 
  CreditCard, User, Bell, Play, BookOpen, Truck, Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

interface OnboardingWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onNavigate: (page: string) => void;
}

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    page: string;
  };
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AfriConnect! 🎉',
    description: 'Your trusted marketplace for authentic African products, skills training, and seamless money transfers. Let\'s take a quick tour!',
    icon: Play,
  },
  {
    id: 'revenue',
    title: 'Track Your Performance',
    description: 'Get a quick overview of your total revenue and other key metrics right from your dashboard.',
    icon: Search,
  },
  {
    id: 'profile',
    title: 'Manage Your Profile',
    description: 'Complete your profile to access all features. Sellers need KYC verification to start selling.',
    icon: User,
    action: {
      label: 'Complete Profile',
      page: 'profile'
    },
  },
    {
    id: 'notifications',
    title: 'Stay Updated',
    description: 'Get notified about order updates, new products, and special offers from your favorite sellers.',
    icon: Bell,
  },
  {
    id: 'search',
    title: 'Discover Amazing Products',
    description: 'Use our powerful search to find authentic African products from verified sellers across the continent.',
    icon: Search,
    action: {
      label: 'Explore Marketplace',
      page: 'marketplace'
    },
  },
];

export function OnboardingWalkthrough({ 
  isOpen, 
  onClose, 
  onComplete, 
  onNavigate 
}: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);
  
  const currentStepData = walkthroughSteps[currentStep];

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };
  
  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleActionClick = (action: { label: string; page: string }) => {
    handleComplete();
    onNavigate(action.page);
  };
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            onClick={handleSkip}
          />
          
          {/* Walkthrough Modal */}
          <motion.div
            key={currentStepData.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <Card className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] shadow-2xl border-2">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Step {currentStep + 1} of {walkthroughSteps.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkip}
                    className="w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
                      <currentStepData.icon className="w-8 h-8 text-primary" />
                    </div>

                    <h3 className="font-semibold text-center mb-3 text-lg">
                      {currentStepData.title}
                    </h3>

                    <p className="text-muted-foreground text-sm text-center leading-relaxed mb-6">
                      {currentStepData.description}
                    </p>

                    {currentStepData.action && (
                      <div className="text-center mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(currentStepData.action!)}
                          className="gap-2"
                        >
                          {currentStepData.action.label}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="text-muted-foreground"
                    >
                      Skip Tour
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="gap-1"
                    >
                      {currentStep === walkthroughSteps.length - 1 ? 'Get Started' : 'Next'}
                      {currentStep !== walkthroughSteps.length - 1 && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[101]"
          >
            <div className="bg-background/90 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                {walkthroughSteps.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
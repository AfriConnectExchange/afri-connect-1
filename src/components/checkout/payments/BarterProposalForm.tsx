'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Handshake, ArrowLeft, ArrowRight, Send, Package, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BarterStep1_YourOffer } from './barter-steps/step1-your-offer';
import { BarterStep2_ExchangeDetails } from './barter-steps/step2-exchange-details';
import { useToast } from '@/hooks/use-toast';

interface BarterProposalFormProps {
  targetProduct: {
    id: any;
    name: string;
    seller: string;
    estimatedValue: number;
  };
  onConfirm: (data: BarterFormData) => void;
  onCancel: () => void;
}

export interface BarterFormData {
    offerType: 'product' | 'service';
    itemName: string;
    description: string;
    estimatedValue: string;
    condition: string;
    category: string;
    exchangeLocation: 'seller_location' | 'buyer_location' | 'mutual_location' | 'shipping';
    proposalExpiry: '1' | '3' | '5' | '7';
    additionalNotes: string;
}

const steps = [
    { id: 'offer', name: 'Your Offer' },
    { id: 'details', name: 'Exchange Details' }
];

export function BarterProposalForm({ targetProduct, onConfirm, onCancel }: BarterProposalFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const [formData, setFormData] = useState<BarterFormData>({
    offerType: 'product',
    itemName: '',
    description: '',
    estimatedValue: '',
    condition: '',
    category: '',
    exchangeLocation: 'mutual_location',
    proposalExpiry: '7',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BarterFormData, string>>>({});

  const handleInputChange = (field: keyof BarterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepIndex: number) => {
    const newErrors: Partial<Record<keyof BarterFormData, string>> = {};
    if (stepIndex === 0) {
        if (!formData.itemName || formData.itemName.length < 3) newErrors.itemName = 'Item/service name must be at least 3 characters';
        if (!formData.description || formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
        if (!formData.estimatedValue || parseFloat(formData.estimatedValue) <= 0) newErrors.estimatedValue = 'Please enter a valid estimated value';
        if (formData.offerType === 'product' && !formData.condition) newErrors.condition = 'Please select item condition';
        if (!formData.category) newErrors.category = 'Please select a category';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    }
  }
  
  const prevStep = () => {
     if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
     }
  }

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1)) {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please fill in all required fields before submitting.',
        });
        return;
    };

    setIsSubmitting(true);
    await onConfirm(formData);
    setIsSubmitting(false);
  };
  
  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Handshake />
                Propose a Barter
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Progress value={((currentStep + 1) / steps.length) * 100} className="mb-4" />
            
            <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-1">Trading For:</h4>
            <div className="flex justify-between items-center">
                <p className="font-medium text-sm">{targetProduct.name}</p>
                <p className="font-semibold text-sm">~£{targetProduct.estimatedValue}</p>
            </div>
            </div>

            {currentStep === 0 && (
                <BarterStep1_YourOffer formData={formData} onInputChange={handleInputChange} errors={errors} targetValue={targetProduct.estimatedValue} />
            )}
            
            {currentStep === 1 && (
                <BarterStep2_ExchangeDetails formData={formData} onInputChange={handleInputChange} errors={errors} />
            )}

            <div className="flex justify-between items-center pt-4">
                <div>
                    {currentStep > 0 && (
                        <Button variant="secondary" onClick={prevStep}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    {currentStep < steps.length - 1 ? (
                        <Button onClick={nextStep}>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            <Send className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Sending...' : 'Send Proposal'}
                        </Button>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
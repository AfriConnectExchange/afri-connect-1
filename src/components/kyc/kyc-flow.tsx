'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PersonalInfoStep } from './steps/personal-info-step';
import { BusinessInfoStep } from './steps/business-info-step';
import { DocumentUploadStep } from './steps/document-upload-step';
import { ReviewStep } from './steps/review-step';
import { CompletionStep } from './steps/completion-step';
import { KycProgress } from './kyc-progress';

interface KYCPageProps {
  onNavigate: (page: string) => void;
}

export type KYCStep = 'personal' | 'business' | 'documents' | 'review' | 'complete';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete';

export interface DocumentUpload {
  id: string;
  name: string;
  file: File | null;
  required: boolean;
  uploaded: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface KYCData {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  idType: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  businessName: string;
  businessType: string;
  businessRegistrationNumber: string;
  taxId: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessPostalCode: string;
  businessDescription: string;
  estimatedMonthlyVolume: string;
  primaryPhone: string;
  secondaryPhone: string;
  businessEmail: string;
  website: string;
}

export function KycFlow({ onNavigate }: KYCPageProps) {
  const [currentStep, setCurrentStep] = useState<KYCStep>('personal');
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('incomplete');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [kycData, setKycData] = useState<KYCData>({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    idNumber: '',
    idType: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    businessName: '',
    businessType: '',
    businessRegistrationNumber: '',
    taxId: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessPostalCode: '',
    businessDescription: '',
    estimatedMonthlyVolume: '',
    primaryPhone: '',
    secondaryPhone: '',
    businessEmail: '',
    website: '',
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { id: 'government_id', name: 'Government ID', file: null, required: true, uploaded: false, status: 'pending' },
    { id: 'proof_of_address', name: 'Proof of Address', file: null, required: true, uploaded: false, status: 'pending' },
    { id: 'business_registration', name: 'Business Registration', file: null, required: true, uploaded: false, status: 'pending' },
    { id: 'tax_certificate', name: 'Tax Certificate', file: null, required: false, uploaded: false, status: 'pending' },
    { id: 'bank_statement', name: 'Bank Statement', file: null, required: true, uploaded: false, status: 'pending' },
    { id: 'business_license', name: 'Business License', file: null, required: false, uploaded: false, status: 'pending' },
  ]);

  const handleInputChange = (field: keyof KYCData, value: string) => {
    setKycData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (step: KYCStep) => {
    switch (step) {
      case 'personal':
        const requiredPersonal = ['fullName', 'dateOfBirth', 'nationality', 'idNumber', 'idType', 'address', 'city', 'primaryPhone'];
        const missingPersonal = requiredPersonal.filter(field => !kycData[field as keyof KYCData]);
        if (missingPersonal.length > 0) {
            setError(`Please fill in all required fields: ${missingPersonal.join(', ')}`);
            return false;
        }
        return true;
      case 'business':
         const requiredBusiness = ['businessName', 'businessType', 'businessAddress', 'businessCity', 'businessDescription'];
        const missingBusiness = requiredBusiness.filter(field => !kycData[field as keyof KYCData]);
        if (missingBusiness.length > 0) {
            setError(`Please fill in all required fields: ${missingBusiness.join(', ')}`);
            return false;
        }
        return true;
      case 'documents':
        const requiredDocs = documents.filter(doc => doc.required && !doc.uploaded);
        if (requiredDocs.length > 0) {
            setError(`Please upload all required documents: ${requiredDocs.map(doc => doc.name).join(', ')}`);
            return false;
        }
        return true;
      default:
        return true;
    }
  }

  const nextStep = () => {
    setError('');
    if (validateStep(currentStep)) {
      const steps: KYCStep[] = ['personal', 'business', 'documents', 'review', 'complete'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        if (currentStep === 'review') {
          submitKYC();
        } else {
          setCurrentStep(steps[currentIndex + 1]);
        }
      }
    }
  };

  const previousStep = () => {
    const steps: KYCStep[] = ['personal', 'business', 'documents', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };
  
  const submitKYC = async () => {
    setIsLoading(true);
    setError('');

    try {
      // In a real app, you would upload files and submit data to your KYC service
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setVerificationStatus('pending');
      setCurrentStep('complete');
      setSuccess('KYC application submitted successfully! We will review your information within 2-3 business days.');
    } catch (err: any) {
      setError('Failed to submit KYC application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const renderStepContent = () => {
    switch(currentStep) {
        case 'personal':
            return <PersonalInfoStep kycData={kycData} onInputChange={handleInputChange} />;
        case 'business':
            return <BusinessInfoStep kycData={kycData} onInputChange={handleInputChange} />;
        case 'documents':
            return <DocumentUploadStep documents={documents} setDocuments={setDocuments} setError={setError} />;
        case 'review':
            return <ReviewStep kycData={kycData} documents={documents} />;
        case 'complete':
            return <CompletionStep verificationStatus={verificationStatus} onNavigate={onNavigate} />;
        default:
            return null;
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('/profile')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
        <div>
          <h1 className="text-xl font-bold">KYC Verification</h1>
          <p className="text-sm text-muted-foreground">
            Complete your seller verification to start trading
          </p>
        </div>
      </div>

      <KycProgress currentStep={currentStep} />
      
      {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
       )}

      {success && currentStep === 'complete' && (
        <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">{renderStepContent()}</div>

      {currentStep !== 'complete' && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 'personal' || isLoading}
          >
            Previous
          </Button>
          <Button onClick={nextStep} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {currentStep === 'review' ? 'Submit Application' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
}

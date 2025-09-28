'use client';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CustomOTP } from '../ui/custom-otp';
import { AnimatedButton } from '../ui/animated-button';

type Props = any;

export default function OTPVerification({
  formData,
  handleOTPComplete,
  handleResendOTP,
  isLoading,
  onBack
}: Props) {
  return (
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 relative">
          <AnimatedButton
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </AnimatedButton>

          <CustomOTP
            onComplete={handleOTPComplete}
            onResend={handleResendOTP}
            isLoading={isLoading}
            phone={formData.phone}
          />
        </div>
      </div>
  );
}

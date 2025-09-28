'use client';
import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { AnimatedButton } from '../ui/animated-button';
import { ArrowLeft } from 'lucide-react';

interface Props {
  formData: any;
  handleOTPComplete: (otp: string) => void;
  handleResendOTP: () => void;
  isLoading: boolean;
  onBack: () => void;
}

export function OTPVerification({ formData, handleOTPComplete, handleResendOTP, isLoading, onBack }: Props) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== '' && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }

      if(newOtp.every(digit => digit !== '')) {
        handleOTPComplete(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden w-full max-w-md">
        <div className="p-8 sm:p-10 text-center relative">
         <AnimatedButton
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </AnimatedButton>
          <h2 className="text-2xl font-bold mb-2 pt-8">Verify Your Phone</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Enter the 6-digit code sent to {formData.phone}.
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-semibold bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition"
              />
            ))}
          </div>
          
          <AnimatedButton
            onClick={() => handleOTPComplete(otp.join(''))}
            isLoading={isLoading}
            disabled={otp.some(digit => digit === '')}
            className="w-full"
            animationType="glow"
          >
            Verify
          </AnimatedButton>

          <div className="mt-4 text-sm">
            Didn't receive the code?{' '}
            <button onClick={handleResendOTP} disabled={isLoading} className="text-primary hover:underline font-semibold disabled:text-muted-foreground disabled:cursor-not-allowed">
              Resend OTP
            </button>
          </div>
        </div>
    </div>
  );
}
export default OTPVerification;

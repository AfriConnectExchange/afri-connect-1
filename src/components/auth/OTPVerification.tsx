'use client';
import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { AnimatedButton } from '../ui/animated-button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User, updateProfile } from 'firebase/auth';

interface Props {
  phone: string;
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
  onResend: () => Promise<void>;
}

export function OTPVerification({ phone, onAuthSuccess, onBack, onResend }: Props) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);


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
        handleOtpVerification(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };
  
  const handleOtpVerification = async (otpValue: string) => {
    setIsLoading(true);
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error("No confirmation result found. Please try sending the OTP again.");
      }
      const result = await confirmationResult.confirm(otpValue);
      toast({ title: 'Verification Successful!', description: 'Redirecting...' });
      onAuthSuccess(result.user);
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
       setIsLoading(false);
    }
  }
  
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
        await onResend();
        setResendCooldown(30); // Reset cooldown
        toast({ title: 'OTP Resent', description: `A new code has been sent to ${phone}.`});
    } catch (error) {
        // Error is already handled in the onResend implementation (SignIn/Up cards)
    } finally {
        setIsLoading(false);
    }
  }

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
            Enter the 6-digit code sent to {phone}.
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
                className="w-10 h-12 text-center text-xl font-semibold bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary transition"
              />
            ))}
          </div>
          
          <AnimatedButton
            onClick={() => handleOtpVerification(otp.join(''))}
            isLoading={isLoading}
            disabled={otp.some(digit => digit === '')}
            className="w-full"
            animationType="glow"
          >
            Verify
          </AnimatedButton>

          <div className="mt-4 text-sm">
            Didn't receive the code?{' '}
            <button onClick={handleResendOTP} disabled={isLoading || resendCooldown > 0} className="text-primary hover:underline font-semibold disabled:text-muted-foreground disabled:cursor-not-allowed">
              Resend OTP {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
            </button>
          </div>
        </div>
    </div>
  );
}
export default OTPVerification;

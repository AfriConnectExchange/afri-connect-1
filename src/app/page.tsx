'use client';
import { useEffect, useState, useCallback } from 'react';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import SignInCard from '@/components/auth/SignInCard';
import SignUpCard from '@/components/auth/SignUpCard';
import CheckEmailCard from '@/components/auth/CheckEmailCard';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/loader';
import { createClient } from '@/lib/supabase/client';
import { type User, type Session } from '@supabase/supabase-js';
import OTPVerification from '@/components/auth/OTPVerification';

type AuthMode = 'signin' | 'signup' | 'awaiting-verification' | 'otp';

export default function Home() {
  const supabase = createClient();
  const [isClient, setIsClient] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // This ensures the component only renders on the client, avoiding hydration errors
    // with authentication logic.
    setIsClient(true);
    
    // Check if the user is already logged in, the middleware should handle redirects,
    // but this can provide a smoother experience if the user lands here momentarily.
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            router.replace('/marketplace');
        }
    }
    checkUser();

  }, [router, supabase]);

  const authBgImage = PlaceHolderImages.find((img) => img.id === 'auth-background');

  const showAlert = (
    variant: 'default' | 'destructive',
    title: string,
    description: string
  ) => {
    toast({ variant, title, description });
  };

  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }));
  };

  const handleEmailRegistration = async () => {
    if (formData.password !== formData.confirmPassword) {
      showAlert('destructive', 'Error', 'Passwords do not match.');
      return;
    }
    if (!formData.acceptTerms) {
      showAlert('destructive', 'Error', 'You must accept the terms and conditions.');
      return;
    }
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      showAlert('destructive', 'Registration Failed', error.message);
    } else {
      showAlert('default', 'Registration Successful!', 'Please check your email to verify your account.');
      setAuthMode('awaiting-verification');
    }
    setIsLoading(false);
  };
  
    const handlePhoneRegistration = async () => {
    if (!formData.phone) {
      showAlert('destructive', 'Error', 'Phone number is required.');
      return;
    }
     if (formData.password !== formData.confirmPassword) {
      showAlert('destructive', 'Error', 'Passwords do not match.');
      return;
    }
    if (!formData.acceptTerms) {
      showAlert('destructive', 'Error', 'You must accept the terms and conditions.');
      return;
    }
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
        phone: formData.phone,
        password: formData.password,
        options: {
            data: {
                full_name: formData.name,
            }
        }
    });

    if (error) {
        showAlert('destructive', 'Registration Failed', error.message);
        setIsLoading(false);
    } else {
        showAlert('default', 'OTP Sent!', 'Please enter the code sent to your phone.');
        setAuthMode('otp');
        setIsLoading(false);
    }
  };
  
  const handleOtpVerification = async (otp: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
        phone: formData.phone,
        token: otp,
        type: 'sms',
    });

    if (error) {
        showAlert('destructive', 'Verification Failed', error.message);
        setIsLoading(false);
    } else {
        showAlert('default', 'Verification Successful!', 'You are now logged in.');
        router.refresh();
    }
  }


  const handleEmailLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
        if (error.message === 'Email not confirmed') {
            setAuthMode('awaiting-verification');
             showAlert('destructive', 'Verification Required', 'Please check your email to verify your account before signing in.');
        } else {
            showAlert('destructive', 'Login Failed', error.message);
        }
        setIsLoading(false);
    } else {
       // On successful login, the middleware will handle the redirect.
       // We can force a reload to trigger the middleware check.
       router.refresh();
    }
  };
  
  const handlePhoneLogin = async () => {
    if (!formData.phone) {
      showAlert('destructive', 'Error', 'Phone number is required.');
      return;
    }
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
        phone: formData.phone,
    });

    if (error) {
        showAlert('destructive', 'Failed to Send OTP', error.message);
        setIsLoading(false);
    } else {
        showAlert('default', 'OTP Sent!', 'Please enter the code sent to your phone.');
        setAuthMode('otp');
        setIsLoading(false);
    }
  };


  if (!isClient) {
    return <PageLoader />;
  }


  const renderAuthCard = () => {
    switch (authMode) {
      case 'signin':
        return (
          <SignInCard
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            handleEmailLogin={handleEmailLogin}
            handlePhoneLogin={handlePhoneLogin}
            onSwitch={() => handleSwitchMode('signup')}
          />
        );
      case 'signup':
        return (
          <SignUpCard
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            isLoading={isLoading}
            handleEmailRegistration={handleEmailRegistration}
            handlePhoneRegistration={handlePhoneRegistration}
            onSwitch={() => handleSwitchMode('signin')}
          />
        );
       case 'awaiting-verification':
        return (
          <CheckEmailCard
            email={formData.email}
            onBack={() => setAuthMode('signin')}
            isVerifying={isLoading}
          />
        );
       case 'otp':
        return (
            <OTPVerification
                formData={formData}
                handleOTPComplete={handleOtpVerification}
                handleResendOTP={handlePhoneLogin}
                isLoading={isLoading}
                onBack={() => setAuthMode('signin')}
            />
        )
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 p-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          {authBgImage && (
            <Image
              src={authBgImage.imageUrl}
              alt={authBgImage.description}
              fill
              className="object-cover"
              data-ai-hint={authBgImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-zinc-900/60" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Logo withText={false} />
            <span className="ml-2">AfriConnect Exchange</span>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Connecting the diaspora, one transaction at a time.
                Secure, fast, and reliable exchanges for a new era of
                commerce.&rdquo;
              </p>
              <footer className="text-sm">The Future of Exchange</footer>
            </blockquote>
          </div>
        </div>
        <div className="p-4 lg:p-8 flex items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
            {renderAuthCard()}
          </div>
        </div>
      </div>
    </div>
  );
}

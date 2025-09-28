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

type AuthMode = 'signin' | 'signup' | 'awaiting-verification';

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleAuthChange = useCallback(
    (event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      setSession(session);
      setIsUserLoading(false);

      if (session?.user) {
        // If user is signed in, check if onboarding is complete
        // In a real app, you'd fetch this from the 'profiles' table
        const checkOnboarding = async () => {
          // Mocking onboarding check for now.
          // Replace with: const { data } = await supabase.from('profiles').select('onboarding_completed').single();
          const onboardingCompleted = false; // Assume false for this example
          
          if (!onboardingCompleted) {
            router.push('/onboarding');
          } else {
            router.push('/marketplace');
          }
        };

        checkOnboarding();
      }
    },
    [router]
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, handleAuthChange]);


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
    } 
    // The onAuthStateChange listener will handle the redirect on success.
    setIsLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    setIsLoading(false);
  };


  const renderAuthCard = () => {
    if (isUserLoading || session?.user) {
      return <PageLoader />;
    }

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
            handleGoogleLogin={handleGoogleLogin}
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
            handleGoogleLogin={handleGoogleLogin}
            onSwitch={() => handleSwitchMode('signin')}
          />
        );
       case 'awaiting-verification':
        return (
          <CheckEmailCard
            email={formData.email}
            onBack={() => setAuthMode('signin')}
            isVerifying={false} // This component is now just for display
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
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
        <div className="lg:p-8 flex items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            {renderAuthCard()}
          </div>
        </div>
      </div>
    </div>
  );
}

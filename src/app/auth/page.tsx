
'use client';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import SignInCard from '@/components/auth/SignInCard';
import SignUpCard from '@/components/auth/SignUpCard';
import CheckEmailCard from '@/components/auth/CheckEmailCard';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/loader';
import { useUser, useFirestore, useAuth } from '@/firebase';
import {
  Auth,
  User,
  sendEmailVerification,
  signOut as firebaseSignOut,
  getAdditionalUserInfo
} from 'firebase/auth';
import OTPVerification from '@/components/auth/OTPVerification';
import { doc, getDoc, setDoc } from 'firebase/firestore';


type AuthMode = 'signin' | 'signup' | 'awaiting-verification' | 'otp';


export default function AuthPage() {
  const firestore = useFirestore();
  const { user: firebaseUser, isLoading: isUserLoading } = useUser();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [phoneForVerification, setPhoneForVerification] = useState('');
  const [authAction, setAuthAction] = useState<'signin' | 'signup'>('signin');
  const [resendOtp, setResendOtp] = useState<(() => Promise<void>) | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  // Email verification listener
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (authMode === 'awaiting-verification' && firebaseUser && !firebaseUser.emailVerified) {
      setIsVerifying(true);
      intervalId = setInterval(async () => {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          setIsVerifying(false);
          if(intervalId) clearInterval(intervalId);
          toast({ title: 'Email Verified!', description: 'Redirecting you to complete your profile.' });
           // After verification, middleware will handle the redirect.
           // We just refresh the page to trigger it.
          router.refresh();
        }
      }, 3000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [authMode, firebaseUser, router, toast]);

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
  };
  
  const createProfileDocument = async (user: User, additionalData = {}) => {
    if (!firestore) return;
    const profileRef = doc(firestore, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
        const profileData = {
          id: user.uid,
          auth_user_id: user.uid,
          email: user.email,
          full_name: user.displayName || '',
          phone_number: user.phoneNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: false,
          primary_role: 'buyer',
          ...additionalData,
        };
        await setDoc(profileRef, profileData, { merge: true });
    }
  }

  const handleAuthSuccess = async (user: User, isNewUser: boolean = false) => {
    // For email signup, trigger verification flow.
    if (authAction === 'signup' && user.providerData[0].providerId === 'password' && !user.emailVerified) {
        await sendEmailVerification(user);
        setEmailForVerification(user.email || '');
        setAuthMode('awaiting-verification');
        showAlert('default', 'Registration Successful!', 'Please check your email to verify your account.');
        return;
    }

    try {
        if (isNewUser) {
            await createProfileDocument(user);
        }

        toast({
          title: 'Sign In Successful!',
          description: "You'll be redirected shortly.",
        });

        // Get the Firebase ID token.
        const idToken = await user.getIdToken();

        // Send the token to our API route to create a session cookie.
        const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to create session.');
        }
        
        // Now that the session cookie is set, we can redirect.
        // The middleware will pick up the cookie and handle routing to onboarding or the homepage.
        window.location.href = '/';

    } catch (err: any) {
        console.error('Failed during auth success handling:', err);
        showAlert('destructive', 'Error', 'Could not complete sign-in. Please try again.');
    }
  }

  const handleNeedsOtp = (phone: string, resend: () => Promise<void>) => {
    setAuthAction(authAction);
    setPhoneForVerification(phone);
    setResendOtp(() => resend); // Store the resend function
    setAuthMode('otp');
  }

  if (isUserLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  const renderAuthCard = () => {
    switch (authMode) {
      case 'signin':
        return (
          <SignInCard
            onSwitch={() => handleSwitchMode('signup')}
            onAuthSuccess={handleAuthSuccess}
            onNeedsOtp={handleNeedsOtp}
          />
        );
      case 'signup':
        return (
          <SignUpCard
            onSwitch={() => handleSwitchMode('signin')}
            onAuthSuccess={handleAuthSuccess}
            onNeedsOtp={handleNeedsOtp}
          />
        );
        case 'awaiting-verification':
        return (
          <CheckEmailCard
            email={emailForVerification}
            onBack={() => setAuthMode('signin')}
            isVerifying={isVerifying}
          />
        );
        case 'otp':
        return (
            <OTPVerification
                phone={phoneForVerification}
                onAuthSuccess={handleAuthSuccess}
                onBack={() => setAuthMode(authAction)}
                onResend={resendOtp!}
            />
        )
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-background">
      <div id="recaptcha-container"></div>
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

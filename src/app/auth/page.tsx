
'use client';
import { useEffect, useState, useRef } from 'react';
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
import { getRedirectResult } from 'firebase/auth';
import OTPVerification from '@/components/auth/OTPVerification';

type AuthMode = 'signin' | 'signup' | 'awaiting-verification' | 'otp';

export default function AuthPage() {
  const { user: firebaseUser, isLoading: isUserLoading } = useUser();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [phoneForVerification, setPhoneForVerification] = useState('');
  const [authAction, setAuthAction] = useState<'signin' | 'signup'>('signin');
  const [resendOtp, setResendOtp] = useState<(() => Promise<void>) | null>(null);
  const [authInProgress, setAuthInProgress] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();

  // Track whether we've already handled a redirect or completed the sign-in flow
  // to avoid double-processing.
  const handledRedirect = useRef(false);
  // Prevent concurrent processing of auth success (popup result + redirect/onAuthState races)
  const authProcessing = useRef(false);

  // Email verification listener
  useEffect(() => {
    // Handle redirect results (if user was redirected for social login)
    (async () => {
      if (!auth) return;
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const additional = getAdditionalUserInfo(result);
          console.debug('[auth] redirect result received', { isNewUser: additional?.isNewUser });
            await handleAuthSuccess(result.user as User, additional?.isNewUser);
            handledRedirect.current = true;
        }
      } catch (err: any) {
        // This can happen if there's no redirect result, which is normal.
        // We only care about actual errors.
        if (err.code !== 'auth/no-redirect-operation') {
            console.warn('[auth] getRedirectResult failed', err.code, err.message);
        }
      }
    })();

    // If getRedirectResult didn't return a result (it can be null if onAuthStateChanged
    // already updated the user), fall back to using the firebaseUser from the
    // onAuthStateChanged listener so we still create the session and redirect.
    // We guard with handledRedirect to avoid double-processing.
    if (!handledRedirect.current && firebaseUser) {
      (async () => {
        try {
          console.debug('[auth] no redirect payload but firebaseUser present — completing auth flow from onAuthStateChanged');
          await handleAuthSuccess(firebaseUser as User);
          handledRedirect.current = true;
        } catch (e) {
          console.warn('[auth] fallback handleAuthSuccess failed', e);
        }
      })();
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (authMode === 'awaiting-verification' && firebaseUser && !firebaseUser.emailVerified) {
      setIsVerifying(true);
      intervalId = setInterval(async () => {
        if (firebaseUser) {
            await firebaseUser.reload();
            if (firebaseUser.emailVerified) {
              setIsVerifying(false);
              if (intervalId) clearInterval(intervalId);
              toast({ title: 'Email Verified!', description: 'Redirecting you to complete your profile.' });
              // After verification, middleware will handle the redirect.
              // We just refresh the page to trigger it.
              router.refresh();
            }
        }
      }, 3000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [auth, authMode, firebaseUser, router, toast]);

  // Allow dismissing the authInProgress overlay with Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAuthInProgress(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const authBgImage = PlaceHolderImages.find((img) => img.id === 'auth-background');

  const showAlert = (
    variant: 'default' | 'destructive',
    title: string,
    description: string
  ) => {
    toast({ variant, title, description });
  };

  const handleSwitchMode = (mode: AuthMode, action: 'signin' | 'signup' = 'signin') => {
    setAuthAction(action);
    setAuthMode(mode);
  };
  
  const handleAuthSuccess = async (user: User, isNewUser?: boolean) => {
    if (authProcessing.current) {
      console.debug('[auth] handleAuthSuccess called while already processing - ignoring');
      return;
    }
    authProcessing.current = true;
    const isNewSignUp = isNewUser ?? false;

    // For new email signups, trigger verification flow first.
    if (isNewSignUp && user.providerData[0].providerId === 'password' && !user.emailVerified) {
        try {
            await sendEmailVerification(user);
            setEmailForVerification(user.email || '');
            setAuthMode('awaiting-verification');
            showAlert('default', 'Registration Successful!', 'Please check your email to verify your account.');
        } catch (error) {
            showAlert('destructive', 'Verification Error', 'Could not send verification email. Please try signing in again.');
        }
        return;
    }

  try {
    toast({
      title: isNewSignUp ? 'Sign Up Successful!' : 'Sign In Successful!',
      description: "You'll be redirected shortly.",
    });

    // Get the Firebase ID token.
    const idToken = await user.getIdToken();

    // Collect silent client info: user-agent and geolocation (if allowed)
    const clientInfo: any = { userAgent: navigator.userAgent };
    try {
      if (navigator.geolocation) {
      // attempt to get location quickly without blocking; timeout after 3s
      const geo = await new Promise<GeolocationPosition | null>((resolve) => {
        const onSuccess = (pos: GeolocationPosition) => resolve(pos);
        const onError = () => resolve(null);
        navigator.geolocation.getCurrentPosition(onSuccess, onError, { maximumAge: 60 * 60 * 1000, timeout: 3000 });
      });
      if (geo) {
        clientInfo.location = { latitude: geo.coords.latitude, longitude: geo.coords.longitude, accuracy: geo.coords.accuracy };
      }
      }
    } catch (e) {
      // ignore geolocation errors
    }

    // Send the token + client info to our API route to create a session cookie and check if user is new
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, clientInfo }),
    });
        
    if (!response.ok) {
      throw new Error('Failed to create session.');
    }

    const { isNewUser: isProfileNew } = await response.json();

    // New users from Social/Phone Auth need onboarding. The middleware will handle this.
    if (isProfileNew) {
      window.location.href = '/onboarding';
    } else {
      window.location.href = '/';
    }

  } catch (err: any) {
    console.error('Failed during auth success handling:', err);
    showAlert('destructive', 'Error', 'Could not complete sign-in. Please try again.');
    authProcessing.current = false;
  }
  // Do not reset authProcessing here — navigation should occur on success; if no navigation occurs
  // it will be reset on subsequent failures where we set it back to false.
  }

  const handleNeedsOtp = (phone: string, resend: () => Promise<void>) => {
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
            onSwitch={() => handleSwitchMode('signup', 'signup')}
            onAuthSuccess={handleAuthSuccess}
            onNeedsOtp={handleNeedsOtp}
            onAuthStart={() => setAuthInProgress(true)}
            onAuthEnd={() => setAuthInProgress(false)}
          />
        );
      case 'signup':
        return (
          <SignUpCard
            onSwitch={() => handleSwitchMode('signin', 'signin')}
            onAuthSuccess={handleAuthSuccess}
            onNeedsOtp={handleNeedsOtp}
            onAuthStart={() => setAuthInProgress(true)}
            onAuthEnd={() => setAuthInProgress(false)}
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
            {authInProgress && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/70">
                <div className="relative p-6 rounded-lg flex flex-col items-center gap-4">
                  <button
                    aria-label="Close auth progress"
                    className="absolute -top-3 -right-3 rounded-full bg-muted p-2 hover:bg-muted/80"
                    onClick={() => setAuthInProgress(false)}
                  >
                    ✕
                  </button>
                  <PageLoader />
                  <div className="text-sm text-muted-foreground">Completing sign-in... please do not close or navigate away.</div>
                  <div className="text-xs text-muted-foreground">If this hangs, click ✕ or press Esc to dismiss. This does not cancel any external popup/redirect.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

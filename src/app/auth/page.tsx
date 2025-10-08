
'use client';
import { useEffect, useState, useRef } from 'react';
// Auth page UI – keep imports minimal for layout tweaks
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
      // Small retry loop – sometimes getRedirectResult isn't immediately available
      const tryGetRedirect = async (attempts = 3, delayMs = 500) => {
        for (let i = 0; i < attempts; i++) {
          try {
            const result = await getRedirectResult(auth);
            return result;
          } catch (err: any) {
            // If there's no redirect operation yet, wait and retry
            if (err && err.code === 'auth/no-redirect-operation') {
              // wait before retrying
              await new Promise((r) => setTimeout(r, delayMs));
              continue;
            }
            // any other error should be logged and rethrown
            console.warn('[auth] getRedirectResult failed', err?.code, err?.message);
            throw err;
          }
        }
        return null;
      };

      try {
        const result = await tryGetRedirect(4, 600);
        if (result && result.user) {
          const additional = getAdditionalUserInfo(result);
          console.debug('[auth] redirect result received', { isNewUser: additional?.isNewUser });
            // Clear the transient sessionStorage flag if present
            try { sessionStorage.removeItem('afri:social-redirect'); } catch {}
            await handleAuthSuccess(result.user as User, additional?.isNewUser);
            handledRedirect.current = true;
            return; // stop further fallback handling
        }
      } catch (err: any) {
        // If this is a benign 'no-redirect-operation' after retries, ignore; otherwise log.
        if (err && err.code !== 'auth/no-redirect-operation') {
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
          try { sessionStorage.removeItem('afri:social-redirect'); } catch {}
        } catch (e) {
          console.warn('[auth] fallback handleAuthSuccess failed', e);
        }
      })();
    }

    // If we attempted a redirect (session flag set) but after retries nothing
    // was processed, show a non-blocking hint to the user to try again.
    try {
      const attempted = sessionStorage.getItem('afri:social-redirect');
      if (attempted && !handledRedirect.current) {
        // Clear the flag so we only show this once per return
        sessionStorage.removeItem('afri:social-redirect');
        toast({ title: 'Welcome back', description: 'If you were signing in with Google/Facebook and nothing happened, try the button again.' });
      }
    } catch {}

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

  // auth background image intentionally unused for a leaner auth layout

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
      <div className="relative min-h-screen flex-col items-center justify-center p-0">
        <div className="p-3 lg:p-6 flex items-center justify-center">
          <div className="mx-auto flex w-full max-w-[520px] flex-col justify-center space-y-6 px-4 text-sm">
            {renderAuthCard()}
            {/* authInProgress overlay removed to avoid blocking UX when provider popups/redirects misbehave */}
          </div>
        </div>
      </div>
    </div>
  );
}


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
} from 'firebase/auth';
import OTPVerification from '@/components/auth/OTPVerification';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';


type AuthMode = 'signin' | 'signup' | 'awaiting-verification' | 'otp';


export default function AuthPage() {
  const firestore = useFirestore();
  const { user: firebaseUser, isLoading: isUserLoading } = useUser();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [phoneForVerification, setPhoneForVerification] = useState('');
  const [authAction, setAuthAction] = useState<'signin' | 'signup'>('signin');
  const [resendOtp, setResendOtp] = useState<(() => Promise<void>) | null>(null);
  // If user clicked a 'Sign up as seller' button before auth, the UI can set
  // sessionStorage.preselect_role = 'seller' (or 'sme'). We read it here and
  // use it after successful auth to preselect role / redirect to KYC.
  const [preselectRole, setPreselectRole] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const [stalled, setStalled] = useState(false);
  const auth = useAuth();


  // Main redirect logic for already logged-in users
  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user state is determined
    }

    if (!firebaseUser) {
      setIsRedirecting(false); // Not logged in, stop loading and show auth forms
      return;
    }

    const checkOnboarding = async () => {
      if (!firestore) return;
      const profileDocRef = doc(firestore, "profiles", firebaseUser.uid);
      
      try {
          const profileDoc = await getDoc(profileDocRef);
          
          if (profileDoc.exists()) {
              if (profileDoc.data().onboarding_completed) {
                  router.replace('/');
              } else {
                  router.replace('/onboarding');
              }
          } else {
              // This is a new user (e.g. from phone sign-in), create their profile and send to onboarding
              await createProfileDocument(firebaseUser);
              router.replace('/onboarding');
          }
      } catch (error) {
          console.error("Error checking onboarding status:", error);
          // Don't redirect, maybe show an error to the user
          setIsRedirecting(false);
          showAlert('destructive', 'Error', 'Could not verify your profile. Please try again.');
      }
    };

    checkOnboarding();
  }, [firebaseUser, isUserLoading, router, firestore]);

  // Show a 'stalled' UI if loading/redirecting takes too long
  useEffect(() => {
    let handle: number | undefined;
    if (isRedirecting || isUserLoading) {
      handle = window.setTimeout(() => setStalled(true), 10000); // 10s
    } else {
      setStalled(false);
    }
    return () => { if (handle) window.clearTimeout(handle); };
  }, [isRedirecting, isUserLoading]);

  // Read any preselected role set before the auth flow (e.g., user clicked "Sign up as seller")
  useEffect(() => {
    try {
      const role = typeof window !== 'undefined' ? window.sessionStorage.getItem('preselect_role') : null;
      if (role) setPreselectRole(role);
    } catch (err) {
      // ignore
    }
  }, []);

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
          setIsRedirecting(true); // Set redirecting state to show loader
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

  const handleAuthSuccess = async (user: User, isNewUser: boolean = false) => {
    // For email signup, trigger verification flow.
    if (authAction === 'signup' && user.providerData[0].providerId === 'password' && !user.emailVerified) {
        await sendEmailVerification(user);
        setEmailForVerification(user.email || '');
        setAuthMode('awaiting-verification');
        showAlert('default', 'Registration Successful!', 'Please check your email to verify your account.');
        return;
    }

    // Ensure a profile document exists for the authenticated user.
    // This covers new social logins and cases where a Firebase user exists
    // but a corresponding profile document was never created.
    try {
      if (firestore) {
        const profileRef = doc(firestore, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
          if (!profileSnap.exists()) {
            await createProfileDocument(user);
          }
          // If a preselected role was set (e.g., 'seller' or 'sme'), and the user
          // is a new social signup or has just logged in, update their profile
          // and redirect them straight to the KYC flow for sellers.
          if (preselectRole && ['seller', 'sme'].includes(preselectRole)) {
            try {
              await setDoc(doc(firestore, 'profiles', user.uid), { primary_role: preselectRole }, { merge: true });
              // clear session flag so it doesn't apply again
              if (typeof window !== 'undefined') window.sessionStorage.removeItem('preselect_role');
              // send user to KYC page directly
              router.replace('/kyc');
              return;
            } catch (err: any) {
              console.error('Failed to set preselect role:', err);
            }
          }
      } else {
        // Fallback: create profile document using helper if Firestore isn't available
        if (isNewUser) {
          await createProfileDocument(user);
        }
      }
    } catch (err: any) {
      console.error('Failed to ensure profile document exists:', err);
    }

    // For all successful logins/signups, redirect immediately to avoid
    // reliance on middleware timing. New users go to onboarding, others go home.
    try {
      if (isNewUser) {
        router.replace('/onboarding');
      } else {
        // If they selected seller earlier, we may have already redirected to /kyc.
        // Otherwise send them to the home page.
        if (!preselectRole) router.replace('/');
      }
    } catch (err) {
      // Fallback to setting redirecting state which will let the existing
      // logic perform the check.
      console.warn('Immediate redirect failed, falling back to redirecting state', err);
      setIsRedirecting(true);
    }
  }

  const handleNeedsOtp = (phone: string, resend: () => Promise<void>) => {
    setAuthAction(authAction);
    setPhoneForVerification(phone);
    setResendOtp(() => resend); // Store the resend function
    setAuthMode('otp');
  }

  if (isRedirecting || isUserLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <PageLoader />
        {stalled && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card p-4 rounded-lg shadow-lg border">
            <div className="flex items-center gap-4">
              <div className="text-sm">Auth appears stalled. You can retry or clear the server session.</div>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={async () => {
                  try {
                    if (auth) await firebaseSignOut(auth);
                  } catch (e) {
                    console.warn('Retry signOut failed', e);
                  }
                  window.location.reload();
                }}>Retry</button>
                <button className="btn btn-destructive" onClick={async () => {
                  try {
                    // Sign out the Firebase client first to avoid a mismatch where
                    // the client still thinks it's logged in while the server cookie
                    // has been cleared (which causes middleware redirects).
                    try {
                      if (auth) await firebaseSignOut(auth);
                    } catch (clientErr) {
                      console.warn('Client signOut failed (continuing to clear server session)', clientErr);
                    }

                    await fetch('/api/auth/signout', { method: 'POST' });
                    // Reload to allow middleware and client state to sync
                    window.location.reload();
                  } catch (err) {
                    console.error('Failed to clear server session', err);
                    window.location.reload();
                  }
                }}>Clear Session</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const RedirectingCard = () => (
    <Card className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden w-full max-w-md">
      <CardContent className="p-8 sm:p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-3">Verification Successful!</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Please wait while we redirect you...
        </p>
        <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CardContent>
    </Card>
  );


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

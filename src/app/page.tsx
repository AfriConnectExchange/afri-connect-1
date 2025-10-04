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
import { useAuth, useUser, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  updateProfile,
} from 'firebase/auth';
import OTPVerification from '@/components/auth/OTPVerification';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';


type AuthMode = 'signin' | 'signup' | 'awaiting-verification' | 'otp';

// Declare recaptchaVerifier outside the component to persist it
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}


export default function Home() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: firebaseUser, isLoading: isUserLoading } = useUser();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(true); // Start as true
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
                  router.replace('/marketplace');
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
          // The main useEffect will now handle the check and redirection
        }
      }, 3000); // Check every 3 seconds
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
    setFormData((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }));
  };
  
  const createProfileDocument = async (user: any, additionalData = {}) => {
    if (!firestore) return;
    const profileRef = doc(firestore, 'profiles', user.uid);
    const profileData = {
      id: user.uid,
      auth_user_id: user.uid,
      email: user.email,
      full_name: user.displayName || formData.name,
      phone_number: user.phoneNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_completed: false,
      primary_role: 'buyer',
      ...additionalData,
    };
    await setDoc(profileRef, profileData, { merge: true });
  }

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

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      await createProfileDocument(userCredential.user);
      await sendEmailVerification(userCredential.user);

      showAlert('default', 'Registration Successful!', 'Please check your email to verify your account.');
      setAuthMode('awaiting-verification');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        showAlert('destructive', 'Registration Failed', "An account with this email address already exists. Please Log In or use the 'Forgot Password' link.");
      } else {
        showAlert('destructive', 'Registration Failed', error.message);
      }
    }
    setIsLoading(false);
  };

  const setupRecaptcha = () => {
    // Ensure it's run only on the client
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
    return window.recaptchaVerifier;
  }
  
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

    try {
      const appVerifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
      window.confirmationResult = confirmationResult;
      showAlert('default', 'OTP Sent!', 'Please enter the code sent to your phone to complete signup.');
      setAuthMode('otp');
    } catch (error: any) {
      if (error.code === 'auth/invalid-phone-number') {
        showAlert('destructive', 'Failed to Start Signup', 'Invalid phone number provided.');
      } else {
        showAlert('destructive', 'Failed to Start Signup', error.message);
      }
    }

    setIsLoading(false);
  };
  
  const handleOtpVerification = async (otp: string) => {
    setIsLoading(true);
    
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error("No confirmation result found. Please try sending the OTP again.");
      }
      const result = await confirmationResult.confirm(otp);
      
      // If this was a sign-up with a name provided, update profile
      if (formData.name) {
          await updateProfile(result.user, { displayName: formData.name });
      }
      
      showAlert('default', 'Verification Successful!', 'Redirecting...');
      // The main useEffect will handle the rest: profile creation check and redirection.
    } catch (error: any) {
       showAlert('destructive', 'Verification Failed', error.message);
       setIsLoading(false);
    }
  }


  const handleEmailLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      if (!userCredential.user.emailVerified) {
        setAuthMode('awaiting-verification');
        showAlert('destructive', 'Verification Required', 'Please check your email to verify your account before signing in.');
        setIsLoading(false);
      } else {
        // The main useEffect will handle the redirect
      }
    } catch (error: any) {
       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            showAlert('destructive', 'Login Failed', 'Invalid email or password. Please try again.');
       } else {
            showAlert('destructive', 'Login Failed', error.message);
       }
      setIsLoading(false);
    }
  };
  
  const handlePhoneLogin = async () => {
    if (!formData.phone) {
      showAlert('destructive', 'Error', 'Phone number is required.');
      return;
    }
    setIsLoading(true);

    try {
      const appVerifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
      window.confirmationResult = confirmationResult;
      showAlert('default', 'OTP Sent!', 'Please enter the code sent to your phone.');
      setFormData(prev => ({...prev, email: '', name: ''})); // Clear name to indicate it's a login
      setAuthMode('otp');
    } catch (error: any) {
      showAlert('destructive', 'Failed to Send OTP', error.message);
    }
    
    setIsLoading(false);
  };

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    setIsLoading(true);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Let the main useEffect handle profile creation and redirection
    } catch (error: any) {
      showAlert('destructive', 'Login Failed', error.message);
      setIsLoading(false);
    }
  }

  if (isRedirecting || isUserLoading) {
    return <PageLoader />;
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
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            handleEmailLogin={handleEmailLogin}
            handlePhoneLogin={handlePhoneLogin}
            handleGoogleLogin={() => handleSocialLogin('google')}
            handleFacebookLogin={() => handleSocialLogin('facebook')}
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
            handleGoogleLogin={() => handleSocialLogin('google')}
            handleFacebookLogin={() => handleSocialLogin('facebook')}
            onSwitch={() => handleSwitchMode('signin')}
          />
        );
        case 'awaiting-verification':
        return (
          <CheckEmailCard
            email={formData.email}
            onBack={() => setAuthMode('signin')}
            isVerifying={isVerifying}
          />
        );
        case 'otp':
        return (
            <OTPVerification
                formData={formData}
                handleOTPComplete={handleOtpVerification}
                handleResendOTP={formData.name ? handlePhoneRegistration : handlePhoneLogin}
                isLoading={isLoading}
                onBack={() => setAuthMode(formData.name ? 'signup' : 'signin')}
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

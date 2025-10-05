'use client';
import React, { useState } from 'react';
import { Mail, Eye, EyeOff, User, Phone } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { AnimatedButton } from '../ui/animated-button';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { PasswordStrength } from './PasswordStrength';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

type Props = {
    onSwitch: () => void;
    onAuthSuccess: (user: FirebaseUser) => void;
    onNeedsOtp: (phone: string, resend: () => Promise<void>) => void;
};

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,28.718,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

export default function SignUpCard({ onSwitch, onAuthSuccess, onNeedsOtp }: Props) {
  const auth = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupMethod, setSignupMethod] = useState('email');

  const showAlert = (variant: 'default' | 'destructive', title: string, description: string) => {
    toast({ variant, title, description });
  };
  
  const setupRecaptcha = (authInstance: Auth) => {
    if (typeof window !== 'undefined') {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(authInstance, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {},
        });
      } catch (error) {
        console.error("Recaptcha Verifier error", error);
      }
    }
    return window.recaptchaVerifier;
  }
  
  const handleEmailRegistration = async () => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      onAuthSuccess(userCredential.user);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        showAlert('destructive', 'Registration Failed', "An account with this email address already exists. Please Log In or use the 'Forgot Password' link.");
      } else {
        showAlert('destructive', 'Registration Failed', error.message);
      }
    }
    setIsLoading(false);
  };
  
  const handlePhoneRegistration = async () => {
    setIsLoading(true);
    try {
      const appVerifier = setupRecaptcha(auth);
      if (!appVerifier) throw new Error("Could not create Recaptcha Verifier");
      
      const confirmationResult = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
      window.confirmationResult = confirmationResult;
      onNeedsOtp(formData.phone, handlePhoneRegistration);
    } catch (error: any) {
      if (error.code === 'auth/invalid-phone-number') {
        showAlert('destructive', 'Failed to Start Signup', 'Invalid phone number provided.');
      } else {
        showAlert('destructive', 'Failed to Start Signup', error.message);
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    }
    setIsLoading(false);
  };

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    setIsLoading(true);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess(result.user);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        showAlert('destructive', 'Sign Up Failed', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        showAlert('destructive', 'Error', 'Passwords do not match.');
        return;
      }
      if (!formData.acceptTerms) {
        showAlert('destructive', 'Error', 'You must accept the terms and conditions.');
        return;
      }

      if(signupMethod === 'email') {
          handleEmailRegistration();
      } else {
          handlePhoneRegistration();
      }
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="p-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">AE</span>
          </div>
          <span className="text-2xl font-bold">AfriConnect Exchange</span>
        </div>
        <h1 className="text-xl font-semibold mb-2">Join AfriConnect Exchange</h1>
        <p className="text-sm text-muted-foreground">
          Connect, trade, and thrive
        </p>
      </div>
      <div className="p-8">
        <div className="flex flex-col sm:flex-row gap-2">
            <AnimatedButton
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                isLoading={isLoading}
            >
                <GoogleIcon className="mr-2" />
                Google
            </AnimatedButton>
            <AnimatedButton
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('facebook')}
                isLoading={isLoading}
            >
                <FacebookIcon className="mr-2 text-[#1877F2]" />
                Facebook
            </AnimatedButton>
        </div>

        <div className="flex items-center my-6">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">OR SIGN UP WITH</span>
            <Separator className="flex-1" />
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="space-y-4"
        >
         <Tabs value={signupMethod} onValueChange={setSignupMethod} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, email: e.target.value }))
                        }
                        required={signupMethod === 'email'}
                    />
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="phone" className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <PhoneInput
                        id="phone"
                        placeholder="Enter your phone number"
                        international
                        defaultCountry="GB"
                        value={formData.phone}
                        onChange={(value) => setFormData((prev: any) => ({ ...prev, phone: value || ''}))}
                        required={signupMethod === 'phone'}
                    />
                </div>
            </TabsContent>
         </Tabs>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, password: e.target.value }))
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v: boolean) => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
             <PasswordStrength password={formData.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v: boolean) => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) =>
                setFormData((prev: any) => ({
                  ...prev,
                  acceptTerms: Boolean(checked),
                }))
              }
            />
            <Label
              htmlFor="terms"
              className="text-sm text-muted-foreground"
            >
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>
          <AnimatedButton
            type="submit"
            size="lg"
            className="w-full mt-6"
            isLoading={isLoading}
            animationType="glow"
          >
            Create Account
          </AnimatedButton>
        </form>
        
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm mt-4">
            Already have an account?{' '}
            <button
              onClick={onSwitch}
              className="text-primary hover:underline font-semibold"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

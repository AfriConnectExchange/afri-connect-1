
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from '../ui/animated-button';
import { PasswordStrength } from './PasswordStrength';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '@/firebase';
import { confirmPasswordReset } from 'firebase/auth';

const formSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export function ResetPasswordForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);

  useEffect(() => {
    // Firebase sends the oobCode (out-of-band code) in the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      setError('Invalid or missing password reset code. Please request a new link.');
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!oobCode) {
      setError('Password reset code is missing. Please use the link from your email again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated. You can now log in.',
      });
      setPasswordUpdated(true);
      setTimeout(() => router.push('/auth'), 3000);
    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/invalid-action-code') {
            errorMessage = 'The password reset link is invalid or has expired. Please request a new one.';
        } else {
            errorMessage = error.message;
        }
        setError(errorMessage);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
        });
    }

    setIsLoading(false);
  }
  
  if(passwordUpdated) {
     return (
       <Card>
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                 <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle>Password Updated!</CardTitle>
            <CardDescription>
                You can now log in with your new password. Redirecting you to the login page...
            </CardDescription>
        </CardHeader>
       </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Password</CardTitle>
        <CardDescription>
          Please enter a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                   <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <PasswordStrength password={field.value} />
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                   <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {error && <p className="text-sm text-destructive">{error}</p>}

            <AnimatedButton type="submit" className="w-full" isLoading={isLoading} disabled={!oobCode}>
              Update Password
            </AnimatedButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
